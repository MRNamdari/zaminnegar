import { HttpStatus } from '@nestjs/common';
import { AppError } from '../../../common/errors/app.error';

/** Another parcel of the same project already uses this name. */
export class ParcelNameAlreadyExistsError extends AppError {
  readonly statusCode = HttpStatus.CONFLICT;
  readonly code = 'PARCEL_NAME_ALREADY_EXISTS';

  constructor(name?: string) {
    super(name ? `A parcel named "${name}" already exists in this project.` : 'A parcel with this name already exists in this project.', { name });
  }
}
