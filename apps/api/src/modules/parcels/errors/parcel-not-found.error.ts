import { HttpStatus } from '@nestjs/common';
import { AppError } from '../../../common/errors/app.error';

/** The parcel does not exist inside the given project. */
export class ParcelNotFoundError extends AppError {
  readonly statusCode = HttpStatus.NOT_FOUND;
  readonly code = 'PARCEL_NOT_FOUND';

  constructor(parcelId?: string) {
    super(parcelId ? `Parcel ${parcelId} not found.` : 'Parcel not found.');
  }
}
