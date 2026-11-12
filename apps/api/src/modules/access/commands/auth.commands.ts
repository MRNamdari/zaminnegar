import { Command } from '@nestjs/cqrs';
import type { AuthContext, E164Phone } from '../access.types';
import type { RequestOtpResponseDto, VerifyOtpResponseDto } from '../dto/otp.dto';
import type { LoginResponseDto } from '../dto/user.dto';

/** Sends a one-time code to `phone`. `ip` feeds the per-IP limit. */
export class RequestOtpCommand extends Command<RequestOtpResponseDto> {
  constructor(
    readonly phone: E164Phone,
    readonly ip: string | null,
  ) {
    super();
  }
}

/** Signs in with a code; creates the account first when the number is new (sign-up). */
export class VerifyOtpCommand extends Command<VerifyOtpResponseDto> {
  constructor(
    readonly phone: E164Phone,
    readonly code: string,
    /** Display name for a new account; ignored for existing users. */
    readonly name: string | null,
    readonly userAgent: string | null,
  ) {
    super();
  }
}

/** Optional secondary method: email + password. */
export class LoginWithPasswordCommand extends Command<LoginResponseDto> {
  constructor(
    readonly email: string,
    readonly password: string,
    readonly userAgent: string | null,
  ) {
    super();
  }
}

export class LogoutCommand extends Command<void> {
  constructor(readonly auth: AuthContext) {
    super();
  }
}
