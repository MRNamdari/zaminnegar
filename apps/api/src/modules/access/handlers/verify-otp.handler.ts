import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { VerifyOtpCommand } from '../commands/auth.commands';
import { VerifyOtpResponseDto } from '../dto/otp.dto';
import { UserResponseDto } from '../dto/user.dto';
import { UserInactiveError } from '../errors';
import { UserSignedUpEvent } from '../events/user-signed-up.event';
import { OtpService } from '../otp/otp.service';
import { PhoneUserService } from '../services/phone-user.service';
import { SessionService } from '../services/session.service';

@CommandHandler(VerifyOtpCommand)
export class VerifyOtpHandler implements ICommandHandler<VerifyOtpCommand, VerifyOtpResponseDto> {
  constructor(
    private readonly otp: OtpService,
    private readonly phoneUsers: PhoneUserService,
    private readonly sessions: SessionService,
    private readonly events: EventBus,
  ) {}

  async execute({ phone, code, name, userAgent }: VerifyOtpCommand): Promise<VerifyOtpResponseDto> {
    await this.otp.verify(phone, code);
    const { user, isNewUser } = await this.phoneUsers.findOrCreate(phone, name);
    if (!user.isActive) throw new UserInactiveError();

    const { token, expiresAt } = await this.sessions.create(user.id, userAgent);
    if (isNewUser) this.events.publish(new UserSignedUpEvent(user.id, phone));
    return { token, expiresAt, user: UserResponseDto.from(user), isNewUser };
  }
}
