import { ConflictException } from '@nestjs/common';

export class NoActiveProjectError extends ConflictException {
  constructor() {
    super({ code: 'NO_ACTIVE_PROJECT', message: 'Select an active project first (PUT /auth/session/project)' });
  }
}
