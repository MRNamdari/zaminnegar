import { HttpException, HttpStatus } from '@nestjs/common';

export class OtpCooldownError extends HttpException {
  constructor(readonly retryAfterSeconds: number) {
    super({ code: 'OTP_COOLDOWN', message: 'A code was sent recently; wait before requesting another', retryAfterSeconds }, HttpStatus.TOO_MANY_REQUESTS);
  }
}
