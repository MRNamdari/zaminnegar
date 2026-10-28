import { HttpStatus } from '@nestjs/common';
import { AppError } from '../../../common/errors/app.error';

/** No parcel-owner association exists for the requested ids. */
export class ParcelOwnerNotFoundError extends AppError {
  readonly statusCode = HttpStatus.NOT_FOUND;
  readonly code = 'PARCEL_OWNER_NOT_FOUND';

  constructor(parcelId: string, ownerId: string) {
    super(`Owner ${ownerId} was not found on parcel ${parcelId}.`);
  }
}
