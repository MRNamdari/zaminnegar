import { HttpStatus } from '@nestjs/common';
import { AppError } from '../../../common/errors/app.error';

/** No owner exists with the requested id. */
export class OwnerNotFoundError extends AppError {
  readonly statusCode = HttpStatus.NOT_FOUND;
  readonly code = 'OWNER_NOT_FOUND';

  constructor(ownerId?: string) {
    super(ownerId ? `Owner ${ownerId} not found.` : 'Owner not found.');
  }
}
