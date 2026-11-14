import { ConflictException } from '@nestjs/common';

export class LastSuperadminError extends ConflictException {
  constructor() {
    super({ code: 'LAST_SUPERADMIN', message: 'The system must keep at least one active superadmin' });
  }
}
