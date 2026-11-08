import { UnprocessableEntityException } from '@nestjs/common';

export class BlockReparentNotAllowedError extends UnprocessableEntityException {
  constructor() {
    super({ code: 'BLOCK_REPARENT_NOT_ALLOWED', message: 'A block cannot be moved to another region' });
  }
}
