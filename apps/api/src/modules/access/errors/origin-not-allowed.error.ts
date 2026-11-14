import { ForbiddenException } from '@nestjs/common';

export class OriginNotAllowedError extends ForbiddenException {
  constructor() {
    super({ code: 'ORIGIN_NOT_ALLOWED', message: 'Requests from this origin are not allowed' });
  }
}
