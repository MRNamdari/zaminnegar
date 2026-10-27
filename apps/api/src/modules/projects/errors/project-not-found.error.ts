import { HttpStatus } from '@nestjs/common';
import { AppError } from '../../../common/errors/app.error';

/** No project exists with the requested id. */
export class ProjectNotFoundError extends AppError {
  readonly statusCode = HttpStatus.NOT_FOUND;
  readonly code = 'PROJECT_NOT_FOUND';

  constructor(projectId?: string) {
    super(projectId ? `Project ${projectId} not found.` : 'Project not found.');
  }
}
