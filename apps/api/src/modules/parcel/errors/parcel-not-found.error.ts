import { NotFoundException } from '@nestjs/common';

export class ParcelNotFoundError extends NotFoundException {
  constructor(id: string) {
    super({ code: 'PARCEL_NOT_FOUND', message: `Parcel ${id} was not found` });
  }
}
