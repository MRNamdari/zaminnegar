import { Inject, Injectable } from '@nestjs/common';
import { createHmac, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import { DataSource, EntityManager } from 'typeorm';
import type { E164Phone } from '../access.types';
import { InvalidOtpError, OtpAttemptsExceededError, OtpCooldownError, OtpRateLimitedError } from '../errors';
import { OTP_LENGTH, OTP_SETTINGS, type OtpSettings } from './otp.settings';

export interface IssuedOtp {
  challengeId: string;
  /** Plain code, to be delivered and then forgotten: only its keyed hash is stored. */
  code: string;
  expiresAt: Date;
  resendAvailableAt: Date;
}

interface IssueStats {
  since_last: number;
  last_hour: number;
  oldest_age: number | null;
}
interface ChallengeRow {
  id: string;
  code_hash: string;
  attempts: number;
}
type VerifyOutcome = 'ok' | 'invalid' | 'exhausted';

const HOUR_S = 3600;

/**
 * One-time-code challenges. Per phone, `issue` and `verify` are serialised with a transaction-scoped advisory lock,
 * so cooldowns, hourly limits and attempt counters cannot be raced around by parallel requests.
 */
@Injectable()
export class OtpService {
  constructor(
    private readonly dataSource: DataSource,
    @Inject(OTP_SETTINGS) private readonly settings: OtpSettings,
  ) {}

  /** Enforces the limits, supersedes older codes and stores a new challenge. Throws `OtpCooldownError` / `OtpRateLimitedError`. */
  async issue(phone: E164Phone, ip: string | null): Promise<IssuedOtp> {
    const challengeId = randomUUID();
    const code = randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, '0');
    const codeHash = this.hash(phone, challengeId, code);

    const row = await this.dataSource.transaction(async (m) => {
      await this.lock(m, phone);
      await m.query(`DELETE FROM otp_challenges WHERE created_at < now() - interval '1 day'`);

      const [byPhone] = await m.query<IssueStats[]>(
        `SELECT COALESCE(EXTRACT(EPOCH FROM (now() - max(created_at))), 1e9)::float8 AS since_last,
                (count(*) FILTER (WHERE created_at > now() - interval '1 hour'))::int AS last_hour,
                EXTRACT(EPOCH FROM (now() - min(created_at) FILTER (WHERE created_at > now() - interval '1 hour')))::float8 AS oldest_age
           FROM otp_challenges WHERE phone = $1`,
        [phone],
      );
      if (byPhone.since_last < this.settings.resendCooldownSeconds) {
        throw new OtpCooldownError(Math.ceil(this.settings.resendCooldownSeconds - byPhone.since_last));
      }
      if (byPhone.last_hour >= this.settings.maxPerPhonePerHour) {
        throw new OtpRateLimitedError(Math.ceil(HOUR_S - (byPhone.oldest_age ?? 0)));
      }
      if (ip) {
        const [byIp] = await m.query<IssueStats[]>(
          `SELECT 0::float8 AS since_last,
                  (count(*))::int AS last_hour,
                  EXTRACT(EPOCH FROM (now() - min(created_at)))::float8 AS oldest_age
             FROM otp_challenges WHERE ip = $1 AND created_at > now() - interval '1 hour'`,
          [ip],
        );
        if (byIp.last_hour >= this.settings.maxPerIpPerHour) {
          throw new OtpRateLimitedError(Math.ceil(HOUR_S - (byIp.oldest_age ?? 0)));
        }
      }

      await m.query(`UPDATE otp_challenges SET consumed_at = now() WHERE phone = $1 AND consumed_at IS NULL`, [phone]);
      const [inserted] = await m.query<Array<{ expires_at: Date; created_at: Date }>>(
        `INSERT INTO otp_challenges (id, phone, code_hash, expires_at, ip)
         VALUES ($1, $2, $3, now() + make_interval(secs => $4::double precision), $5)
         RETURNING expires_at, created_at`,
        [challengeId, phone, codeHash, this.settings.ttlSeconds, ip],
      );
      return inserted;
    });

    return {
      challengeId,
      code,
      expiresAt: row.expires_at,
      resendAvailableAt: new Date(row.created_at.getTime() + this.settings.resendCooldownSeconds * 1000),
    };
  }

  /** Forgets a challenge whose message could not be delivered, so a provider outage does not burn the user's quota. */
  async discard(challengeId: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM otp_challenges WHERE id = $1`, [challengeId]);
  }

  /** Consumes the latest live challenge of `phone` when `code` matches; otherwise counts the failed attempt and throws. */
  async verify(phone: E164Phone, code: string): Promise<void> {
    const outcome = await this.dataSource.transaction(async (m): Promise<VerifyOutcome> => {
      await this.lock(m, phone);
      const [challenge] = await m.query<ChallengeRow[]>(
        `SELECT id, code_hash, attempts FROM otp_challenges
          WHERE phone = $1 AND consumed_at IS NULL AND expires_at > now()
          ORDER BY created_at DESC LIMIT 1 FOR UPDATE`,
        [phone],
      );
      if (!challenge) return 'invalid';

      if (this.matches(phone, challenge.id, code, challenge.code_hash)) {
        await m.query(`UPDATE otp_challenges SET consumed_at = now(), attempts = attempts + 1 WHERE id = $1`, [challenge.id]);
        return 'ok';
      }
      const attempts = challenge.attempts + 1;
      const exhausted = attempts >= this.settings.maxAttempts;
      await m.query(
        `UPDATE otp_challenges SET attempts = $2, consumed_at = CASE WHEN $3::boolean THEN now() ELSE consumed_at END WHERE id = $1`,
        [challenge.id, attempts, exhausted],
      );
      return exhausted ? 'exhausted' : 'invalid';
    });

    if (outcome === 'exhausted') throw new OtpAttemptsExceededError();
    if (outcome === 'invalid') throw new InvalidOtpError();
  }

  private lock(manager: EntityManager, phone: E164Phone): Promise<unknown> {
    return manager.query(`SELECT pg_advisory_xact_lock(hashtextextended($1, 0))`, [`otp:${phone}`]);
  }

  private hash(phone: string, challengeId: string, code: string): string {
    return createHmac('sha256', this.settings.hmacSecret).update(`${phone}:${challengeId}:${code}`).digest('hex');
  }

  private matches(phone: string, challengeId: string, code: string, storedHash: string): boolean {
    const actual = Buffer.from(this.hash(phone, challengeId, code), 'hex');
    const expected = Buffer.from(storedHash, 'hex');
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }
}
