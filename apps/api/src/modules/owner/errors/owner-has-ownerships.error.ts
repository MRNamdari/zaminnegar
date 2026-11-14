import { ConflictException } from '@nestjs/common';

export class OwnerHasOwnershipsError extends ConflictException {
  constructor(id: string, parcels: number) {
    super({ code: 'OWNER_HAS_OWNERSHIPS', message: `Owner ${id} still holds shares in ${parcels} parcel(s) and cannot be deleted` });
  }
}
