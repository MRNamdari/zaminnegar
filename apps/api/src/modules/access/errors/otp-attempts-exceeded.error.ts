import { HttpException, HttpStatus } from '@nestjs/common';

export class OtpAttemptsExceededError extends HttpException {
  constructor() {
    super({ code: 'OTP_ATTEMPTS_EXCEEDED', message: 'Too many wrong codes; request a new code' }, HttpStatus.TOO_MANY_REQUESTS);
  }
}
