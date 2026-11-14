import { Inject, Injectable, Logger } from '@nestjs/common';
import { createHmac, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import type { EntityManager } from 'typeorm';
import { ACCESS_CONFIG, OTP_LENGTH, type AccessConfig } from '../access.config';
import type { E164Phone } from '../access.types';
import type { OtpPurpose } from '../entities/otp-challenge.entity';
import { OtpCooldownError } from '../errors/otp-cooldown.error';
import { OtpRateLimitedError } from '../errors/otp-rate-limited.error';
import { SmsGateway } from '../sms/sms.gateway';
import { advisoryLock, execute, firstRow } from '../utils/sql';
import { maskPhone } from '../utils/iran-phone';

export interface IssueOtpInput {
  /** What limits are counted on: the E.164 phone, or `username:<name>` when no phone is known. */
  readonly subjectKey: string;
  readonly purpose: OtpPurpose;
  /** The account the code is for; null issues a decoy that can never be redeemed. */
  readonly userId: string | null;
  readonly ip: string | null;
}

export interface IssuedOtp {
  /** Plain code, for delivery only. Never persisted, never logged. */
  readonly code: string;
  readonly expiresAt: Date;
  readonly resendAvailableAt: Date;
}

export type VerifyOtpOutcome =
  | { readonly ok: true; readonly userId: string }
  | { readonly ok: false; readonly reason: 'invalid' | 'exhausted' };

interface LimitRow {
  since_last: number | null;
  subject_count: number;
  ip_count: number;
}
interface ChallengeRow {
  id: string;
  user_id: string | null;
  code_hash: string;
  attempts: number;
  expired: boolean;
}

/**
 * One-time codes: 6 digits from the OS CSPRNG, stored only as an HMAC, single use, with an attempt cap, a resend
 * cooldown and per-subject / per-IP hourly limits. Both methods must run inside the caller's transaction, and
 * `verify` never throws for a wrong code: it returns the outcome so the caller can COMMIT the attempt counter
 * before reporting the failure (a thrown error would roll the counter back and make brute force free).
 */
@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    @Inject(ACCESS_CONFIG) private readonly config: AccessConfig,
    private readonly sms: SmsGateway,
  ) {}

  /** Takes the per-subject lock. Callers that touch other rows first must always lock in the same order. */
  lock(manager: EntityManager, subjectKey: string): Promise<void> {
    return advisoryLock(manager, `otp:${subjectKey}`);
  }

  async issue(manager: EntityManager, input: IssueOtpInput): Promise<IssuedOtp> {
    const { otp } = this.config;
    await this.lock(manager, input.subjectKey);
    await execute(manager, `DELETE FROM otp_challenges WHERE created_at < now() - interval '1 day'`);

    const limits = await firstRow<LimitRow>(
      manager,
      `SELECT
         (SELECT EXTRACT(EPOCH FROM (now() - max(created_at)))::float8 FROM otp_challenges WHERE subject_key = $1) AS since_last,
         (SELECT count(*)::int FROM otp_challenges WHERE subject_key = $1 AND created_at > now() - interval '1 hour') AS subject_count,
         (SELECT count(*)::int FROM otp_challenges WHERE $2::text IS NOT NULL AND ip = $2 AND created_at > now() - interval '1 hour') AS ip_count`,
      [input.subjectKey, input.ip],
    );
    if (limits?.since_last != null && limits.since_last < otp.resendCooldownSeconds) {
      throw new OtpCooldownError(Math.ceil(otp.resendCooldownSeconds - limits.since_last));
    }
    if ((limits?.subject_count ?? 0) >= otp.maxPerSubjectPerHour || (limits?.ip_count ?? 0) >= otp.maxPerIpPerHour) {
      throw new OtpRateLimitedError(3600);
    }

    // A new code invalidates every earlier one for this subject.
    await execute(manager, `UPDATE otp_challenges SET consumed_at = now() WHERE subject_key = $1 AND consumed_at IS NULL`, [
      input.subjectKey,
    ]);

    const id = randomUUID();
    const code = String(randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, '0');
    const inserted = await firstRow<{ expires_at: Date }>(
      manager,
      `INSERT INTO otp_challenges (id, subject_key, purpose, user_id, code_hash, expires_at, ip)
       VALUES ($1, $2, $3::otp_purpose, $4, $5, now() + make_interval(secs => $6), $7)
       RETURNING expires_at`,
      [id, input.subjectKey, input.purpose, input.userId, this.hashCode(id, input.subjectKey, code), otp.ttlSeconds, input.ip],
    );
    if (!inserted) throw new Error('OTP challenge was not stored');
    return { code, expiresAt: inserted.expires_at, resendAvailableAt: new Date(Date.now() + otp.resendCooldownSeconds * 1000) };
  }

  async verify(
    manager: EntityManager,
    input: { subjectKey: string; purpose: OtpPurpose; code: string },
  ): Promise<VerifyOtpOutcome> {
    await this.lock(manager, input.subjectKey);
    const challenge = await firstRow<ChallengeRow>(
      manager,
      `SELECT id, user_id, code_hash, attempts, (expires_at <= now()) AS expired
       FROM otp_challenges
       WHERE subject_key = $1 AND purpose = $2::otp_purpose AND consumed_at IS NULL
       ORDER BY created_at DESC LIMIT 1
       FOR UPDATE`,
      [input.subjectKey, input.purpose],
    );
    if (!challenge) return { ok: false, reason: 'invalid' };
    if (challenge.expired) {
      await execute(manager, `UPDATE otp_challenges SET consumed_at = now() WHERE id = $1`, [challenge.id]);
      return { ok: false, reason: 'invalid' };
    }

    const expected = Buffer.from(this.hashCode(challenge.id, input.subjectKey, input.code), 'hex');
    const stored = Buffer.from(challenge.code_hash, 'hex');
    const matches = expected.length === stored.length && timingSafeEqual(expected, stored);

    // A decoy (no user) can never succeed, but a wrong guess is counted exactly like on a real challenge.
    if (!matches || challenge.user_id === null) {
      const attempts = challenge.attempts + 1;
      const exhausted = attempts >= this.config.otp.maxAttempts;
      await execute(
        manager,
        `UPDATE otp_challenges SET attempts = $2, consumed_at = CASE WHEN $3::boolean THEN now() ELSE consumed_at END WHERE id = $1`,
        [challenge.id, attempts, exhausted],
      );
      return { ok: false, reason: exhausted ? 'exhausted' : 'invalid' };
    }

    await execute(manager, `UPDATE otp_challenges SET consumed_at = now() WHERE id = $1`, [challenge.id]);
    return { ok: true, userId: challenge.user_id };
  }

  /**
   * Sends the code without waiting for the provider, so that response time is the same whether or not a message
   * was sent (it is not, for unknown accounts). Failures are logged; the user can request a new code after the
   * cooldown.
   */
  dispatch(phone: E164Phone, code: string, purpose: OtpPurpose): void {
    this.sms.sendOtp(phone, code, purpose).catch((error: unknown) => {
      this.logger.error(`Could not deliver an OTP to ${maskPhone(phone)}: ${error instanceof Error ? error.message : 'unknown error'}`);
    });
  }

  private hashCode(challengeId: string, subjectKey: string, code: string): string {
    return createHmac('sha256', this.config.otp.hmacSecret).update(`${challengeId}:${subjectKey}:${code}`).digest('hex');
  }
}
