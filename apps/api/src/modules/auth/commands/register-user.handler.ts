import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { OtpDispatchResponseDto } from '../dto/otp-dispatch-response.dto';
import { OtpPurpose } from '../entities/otp-challenge.entity';
import { OtpService, type IssuedOtp } from '../services/otp.service';
import { PasswordService } from '../services/password.service';
import { normalizeIranMobile } from '../utils/iran-phone';
import { advisoryLock, execute, firstRow } from '../utils/sql';
import { RegisterUserCommand } from './register-user.command';

/**
 * Starts a registration. The answer is the same whether the username or phone is free or already registered, so
 * the endpoint cannot be used to look accounts up:
 *
 *  - the Argon2 hash is always computed, and a challenge row is always written (rate limits behave identically);
 *  - only for a free username and phone is an account row (still unusable) created and a code sent;
 *  - an unverified registration never reserves a username or phone: the newest attempt replaces it.
 */
@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand, OtpDispatchResponseDto> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly passwords: PasswordService,
    private readonly otp: OtpService,
  ) {}

  async execute({ dto, ip }: RegisterUserCommand): Promise<OtpDispatchResponseDto> {
    const phone = normalizeIranMobile(dto.phone);
    if (!phone) throw new BadRequestException({ code: 'INVALID_PHONE', message: 'phone must be a valid Iranian mobile number' });
    const passwordHash = await this.passwords.hash(dto.password);

    const result = await this.dataSource.transaction(async (manager): Promise<IssuedOtp & { deliver: boolean }> => {
      // Fixed lock order: username, then phone (inside `otp.issue`).
      await advisoryLock(manager, `register:${dto.username}`);
      await this.otp.lock(manager, phone);

      // Finished accounts, and legacy accounts without a phone, own their username and phone for good.
      const taken = await firstRow<{ one: number }>(
        manager,
        `SELECT 1 AS one FROM users WHERE (phone_verified_at IS NOT NULL OR phone IS NULL) AND (username = $1 OR phone = $2) LIMIT 1`,
        [dto.username, phone],
      );
      if (taken) {
        const decoy = await this.otp.issue(manager, { subjectKey: phone, purpose: OtpPurpose.registration, userId: null, ip });
        return { ...decoy, deliver: false };
      }

      await execute(
        manager,
        `DELETE FROM users WHERE phone_verified_at IS NULL AND phone IS NOT NULL AND (username = $1 OR phone = $2)`,
        [dto.username, phone],
      );
      const user = await firstRow<{ id: string }>(
        manager,
        `INSERT INTO users (username, phone, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id`,
        [dto.username, phone, dto.email ?? null, passwordHash],
      );
      if (!user) throw new Error('User was not stored');
      const issued = await this.otp.issue(manager, { subjectKey: phone, purpose: OtpPurpose.registration, userId: user.id, ip });
      return { ...issued, deliver: true };
    });

    if (result.deliver) this.otp.dispatch(phone, result.code, OtpPurpose.registration);
    return OtpDispatchResponseDto.of(result);
  }
}
