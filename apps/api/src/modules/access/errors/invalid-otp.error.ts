import { BadRequestException } from '@nestjs/common';

export class InvalidOtpError extends BadRequestException {
  constructor() {
    super({ code: 'INVALID_OTP', message: 'The code is invalid or has expired' });
  }
}
