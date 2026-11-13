import { ConflictException } from '@nestjs/common';

export class LastOwnerError extends ConflictException {
  constructor() {
    super({ code: 'LAST_OWNER', message: 'A project must keep at least one owner' });
  }
}
