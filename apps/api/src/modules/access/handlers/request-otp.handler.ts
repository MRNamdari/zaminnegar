import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RequestOtpCommand } from '../commands/auth.commands';
import { RequestOtpResponseDto } from '../dto/otp.dto';
import { OtpService } from '../otp/otp.service';
import { SmsGateway } from '../sms/sms.gateway';

@CommandHandler(RequestOtpCommand)
export class RequestOtpHandler implements ICommandHandler<RequestOtpCommand, RequestOtpResponseDto> {
  private readonly logger = new Logger(RequestOtpHandler.name);

  constructor(
    private readonly otp: OtpService,
    private readonly sms: SmsGateway,
  ) {}

  async execute({ phone, ip }: RequestOtpCommand): Promise<RequestOtpResponseDto> {
    const issued = await this.otp.issue(phone, ip);
    try {
      await this.sms.sendOtp(phone, issued.code);
    } catch (error) {
      await this.otp.discard(issued.challengeId).catch((e: unknown) => this.logger.error(`Could not discard challenge: ${String(e)}`));
      throw error;
    }
    return { expiresAt: issued.expiresAt, resendAvailableAt: issued.resendAvailableAt };
  }
}
