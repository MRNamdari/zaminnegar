import { ConflictException } from '@nestjs/common';

export class BlockNotEmptyError extends ConflictException {
  constructor(parcels: number) {
    super({ code: 'BLOCK_NOT_EMPTY', message: `Block still has ${parcels} parcel(s) and cannot be deleted` });
  }
}
