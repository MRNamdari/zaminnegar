import { ConflictException } from '@nestjs/common';

export class BlockNameTakenError extends ConflictException {
  constructor(name: string) {
    super({ code: 'BLOCK_NAME_TAKEN', message: `A block named "${name}" already exists in this region` });
  }
}
