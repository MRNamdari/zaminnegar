import { ForbiddenException } from '@nestjs/common';

export class PermissionDeniedError extends ForbiddenException {
  constructor() {
    super({ code: 'PERMISSION_DENIED', message: 'You do not have permission to perform this action' });
  }
}
