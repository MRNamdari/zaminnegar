import { ConflictException } from '@nestjs/common';

export class OwnerAlreadyAssignedError extends ConflictException {
  constructor(parcelId: string, ownerId: string) {
    super({ code: 'OWNER_ALREADY_ASSIGNED', message: `Owner ${ownerId} already holds a share in parcel ${parcelId}` });
  }
}
