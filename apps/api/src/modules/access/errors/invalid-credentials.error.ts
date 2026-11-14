import { UnauthorizedException } from '@nestjs/common';

export class InvalidCredentialsError extends UnauthorizedException {
  constructor() {
    super({ code: 'INVALID_CREDENTIALS', message: 'Invalid username or password' });
  }
}
