import { NotFoundException } from '@nestjs/common';

export class BlockNotFoundError extends NotFoundException {
  constructor(id: string) {
    super({ code: 'BLOCK_NOT_FOUND', message: `Block ${id} was not found` });
  }
}
