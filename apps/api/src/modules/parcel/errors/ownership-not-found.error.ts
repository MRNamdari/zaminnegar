import { NotFoundException } from '@nestjs/common';

export class OwnershipNotFoundError extends NotFoundException {
  constructor(parcelId: string, ownerId: string) {
    super({ code: 'OWNERSHIP_NOT_FOUND', message: `Owner ${ownerId} holds no share in parcel ${parcelId}` });
  }
}
