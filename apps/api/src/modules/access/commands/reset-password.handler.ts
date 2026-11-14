import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { OtpPurpose } from '../entities/otp-challenge.entity';
import { InvalidOtpError } from '../errors/invalid-otp.error';
import { OtpAttemptsExceededError } from '../errors/otp-attempts-exceeded.error';
import { UserRepository } from '../repositories/user.repository';
import { OtpService, type VerifyOtpOutcome } from '../services/otp.service';
import { PasswordService } from '../services/password.service';
import { SessionService } from '../services/session.service';
import { otpSubjectKey, parseIdentifier } from '../utils/account-identifier';
import { ResetPasswordCommand } from './reset-password.command';

/**
 * Verifies the code and replaces the password in one transaction, so the password can only change after a
 * successful, single-use verification. Ends the account's session.
 */
@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand, void> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly users: UserRepository,
    private readonly otp: OtpService,
    private readonly passwords: PasswordService,
    private readonly sessions: SessionService,
  ) {}

  async execute({ dto }: ResetPasswordCommand): Promise<void> {
    const identifier = parseIdentifier(dto.identifier);
    const newHash = await this.passwords.hash(dto.newPassword); // also for unknown accounts: same work, same timing

    const outcome = await this.dataSource.transaction(async (manager): Promise<VerifyOtpOutcome> => {
      const account = await this.users.findUsable(identifier, manager);
      const verified = await this.otp.verify(manager, {
        subjectKey: otpSubjectKey(identifier, account),
        purpose: OtpPurpose.passwordReset,
        code: dto.code,
      });
      if (!verified.ok) return verified;
      // The code must belong to the account that is being changed (the phone may have changed hands meanwhile).
      if (!account || account.id !== verified.userId) return { ok: false, reason: 'invalid' };

      await this.users.setPasswordHash(account.id, newHash, manager);
      await this.sessions.revokeAllForUser(manager, account.id);
      return verified;
    });

    if (!outcome.ok) throw outcome.reason === 'exhausted' ? new OtpAttemptsExceededError() : new InvalidOtpError();
  }
}
