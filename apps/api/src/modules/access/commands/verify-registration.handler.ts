import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { OtpPurpose } from '../entities/otp-challenge.entity';
import { InvalidOtpError } from '../errors/invalid-otp.error';
import { OtpAttemptsExceededError } from '../errors/otp-attempts-exceeded.error';
import { SystemRoleName } from '../permissions';
import { OtpService, type VerifyOtpOutcome } from '../services/otp.service';
import { normalizeIranMobile } from '../utils/iran-phone';
import { execute } from '../utils/sql';
import { VerifyRegistrationCommand } from './verify-registration.command';

/** Activates an account once its phone proved ownership with the code. */
@CommandHandler(VerifyRegistrationCommand)
export class VerifyRegistrationHandler implements ICommandHandler<VerifyRegistrationCommand, void> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly otp: OtpService,
  ) {}

  async execute({ dto }: VerifyRegistrationCommand): Promise<void> {
    const phone = normalizeIranMobile(dto.phone);
    if (!phone) throw new BadRequestException({ code: 'INVALID_PHONE', message: 'phone must be a valid Iranian mobile number' });

    // The outcome is returned, not thrown, so the attempt counter commits even when the code is wrong.
    const outcome = await this.dataSource.transaction(async (manager): Promise<VerifyOtpOutcome> => {
      const verified = await this.otp.verify(manager, { subjectKey: phone, purpose: OtpPurpose.registration, code: dto.code });
      if (!verified.ok) return verified;

      const activated = await execute(
        manager,
        `UPDATE users SET phone_verified_at = now(), updated_at = now(),
           system_role_id = COALESCE(system_role_id,
             (SELECT id FROM roles WHERE name = $3 AND scope = 'system' AND project_id IS NULL AND is_system))
         WHERE id = $1 AND phone = $2 AND phone_verified_at IS NULL`,
        [verified.userId, phone, SystemRoleName.user],
      );
      return activated === 1 ? verified : { ok: false, reason: 'invalid' };
    });

    if (!outcome.ok) throw outcome.reason === 'exhausted' ? new OtpAttemptsExceededError() : new InvalidOtpError();
  }
}
