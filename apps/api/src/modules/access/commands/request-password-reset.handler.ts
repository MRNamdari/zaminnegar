import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { OtpDispatchResponseDto } from '../dto/otp-dispatch-response.dto';
import { OtpPurpose } from '../entities/otp-challenge.entity';
import type { E164Phone } from '../access.types';
import { UserRepository } from '../repositories/user.repository';
import { OtpService, type IssuedOtp } from '../services/otp.service';
import { otpSubjectKey, parseIdentifier } from '../utils/account-identifier';
import { RequestPasswordResetCommand } from './request-password-reset.command';

/**
 * Sends a reset code to the phone of the named account. The response is identical for unknown or deactivated
 * accounts (a decoy challenge is stored instead, so limits and timing match; nothing is sent).
 */
@CommandHandler(RequestPasswordResetCommand)
export class RequestPasswordResetHandler implements ICommandHandler<RequestPasswordResetCommand, OtpDispatchResponseDto> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly users: UserRepository,
    private readonly otp: OtpService,
  ) {}

  async execute({ dto, ip }: RequestPasswordResetCommand): Promise<OtpDispatchResponseDto> {
    const identifier = parseIdentifier(dto.identifier);

    const result = await this.dataSource.transaction(async (manager): Promise<IssuedOtp & { deliverTo: E164Phone | null }> => {
      const account = await this.users.findUsable(identifier, manager);
      const issued = await this.otp.issue(manager, {
        subjectKey: otpSubjectKey(identifier, account),
        purpose: OtpPurpose.passwordReset,
        userId: account?.id ?? null,
        ip,
      });
      return { ...issued, deliverTo: account?.phone ?? null };
    });

    if (result.deliverTo) this.otp.dispatch(result.deliverTo, result.code, OtpPurpose.passwordReset);
    return OtpDispatchResponseDto.of(result);
  }
}
