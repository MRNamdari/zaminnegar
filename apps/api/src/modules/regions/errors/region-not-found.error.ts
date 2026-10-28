import { HttpStatus } from '@nestjs/common';
import { AppError } from '../../../common/errors/app.error';

/** No region exists with the requested id. */
export class RegionNotFoundError extends AppError {
  readonly statusCode = HttpStatus.NOT_FOUND;
  readonly code = 'REGION_NOT_FOUND';

  constructor(regionId?: string) {
    super(regionId ? `Region ${regionId} not found.` : 'Region not found.');
  }
}
