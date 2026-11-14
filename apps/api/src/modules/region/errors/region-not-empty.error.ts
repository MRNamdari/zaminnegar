import { ConflictException } from '@nestjs/common';

export class RegionNotEmptyError extends ConflictException {
  constructor(blocks: number, parcels: number) {
    super({ code: 'REGION_NOT_EMPTY', message: `Region still has ${blocks} block(s) and ${parcels} parcel(s) and cannot be deleted` });
  }
}
