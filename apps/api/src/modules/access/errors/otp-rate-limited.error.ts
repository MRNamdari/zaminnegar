import { HttpException, HttpStatus } from '@nestjs/common';

export class OtpRateLimitedError extends HttpException {
  constructor(readonly retryAfterSeconds: number) {
    super({ code: 'OTP_RATE_LIMITED', message: 'Too many code requests; try again later', retryAfterSeconds }, HttpStatus.TOO_MANY_REQUESTS);
  }
}
