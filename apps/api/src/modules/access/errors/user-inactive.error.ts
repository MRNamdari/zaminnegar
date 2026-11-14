import { ForbiddenException } from '@nestjs/common';

export class UserInactiveError extends ForbiddenException {
  constructor() {
    super({ code: 'USER_INACTIVE', message: 'This account has been deactivated' });
  }
}
