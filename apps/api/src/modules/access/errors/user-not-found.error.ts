import { NotFoundException } from '@nestjs/common';

export class UserNotFoundError extends NotFoundException {
  constructor() {
    super({ code: 'USER_NOT_FOUND', message: 'The user was not found' });
  }
}
