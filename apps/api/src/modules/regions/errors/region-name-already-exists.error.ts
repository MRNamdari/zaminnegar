import { HttpStatus } from '@nestjs/common';
import { AppError } from '../../../common/errors/app.error';

/** A region with the same name already exists. */
export class RegionNameAlreadyExistsError extends AppError {
  readonly statusCode = HttpStatus.CONFLICT;
  readonly code = 'REGION_NAME_ALREADY_EXISTS';

  constructor(name: string) {
    super(`A region named "${name}" already exists.`, { name });
  }
}
