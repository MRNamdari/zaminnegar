import { HttpStatus } from '@nestjs/common';
import { AppError } from '../../../common/errors/app.error';

/** A project with the same name already exists. */
export class ProjectNameAlreadyExistsError extends AppError {
  readonly statusCode = HttpStatus.CONFLICT;
  readonly code = 'PROJECT_NAME_ALREADY_EXISTS';

  constructor(name: string) {
    super(`A project named "${name}" already exists.`, { name });
  }
}
