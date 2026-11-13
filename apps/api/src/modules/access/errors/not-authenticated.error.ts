import { UnauthorizedException } from '@nestjs/common';

export class NotAuthenticatedError extends UnauthorizedException {
  constructor() {
    super({ code: 'NOT_AUTHENTICATED', message: 'Authentication is required' });
  }
}
