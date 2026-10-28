import { HttpStatus } from '@nestjs/common';
import { AppError } from '../../../common/errors/app.error';

/** This parcel-owner link already exists. */
export class ParcelOwnerAlreadyExistsError extends AppError {
  readonly statusCode = HttpStatus.CONFLICT;
  readonly code = 'PARCEL_OWNER_ALREADY_EXISTS';

  constructor(parcelId: string, ownerId: string) {
    super(`Owner ${ownerId} is already assigned to parcel ${parcelId}.`);
  }
}
