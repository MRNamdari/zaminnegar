import { HttpStatus } from '@nestjs/common';
import { AppError } from '../../../common/errors/app.error';

/** An owner with the same name already exists. */
export class OwnerNameAlreadyExistsError extends AppError {
  readonly statusCode = HttpStatus.CONFLICT;
  readonly code = 'OWNER_NAME_ALREADY_EXISTS';

  constructor(name: string) {
    super(`Owner ${name} already exists.`);
  }
}
