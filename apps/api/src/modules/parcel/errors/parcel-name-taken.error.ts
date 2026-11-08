import { ConflictException } from '@nestjs/common';

export class ParcelNameTakenError extends ConflictException {
  constructor(name: string) {
    super({ code: 'PARCEL_NAME_TAKEN', message: `A parcel named "${name}" already exists in this project` });
  }
}
