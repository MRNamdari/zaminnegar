import { ForbiddenException } from '@nestjs/common';

export class PhoneNotVerifiedError extends ForbiddenException {
  constructor() {
    super({ code: 'PHONE_NOT_VERIFIED', message: 'The phone number of this account has not been verified' });
  }
}
