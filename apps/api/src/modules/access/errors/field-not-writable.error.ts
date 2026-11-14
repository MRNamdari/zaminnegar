import { ForbiddenException } from '@nestjs/common';

export class FieldNotWritableError extends ForbiddenException {
  constructor(fields: readonly string[]) {
    super({ code: 'FIELD_NOT_WRITABLE', message: `You may not modify: ${fields.join(', ')}` });
  }
}
