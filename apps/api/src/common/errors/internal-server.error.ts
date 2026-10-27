import { HttpStatus } from '@nestjs/common';
import { AppError } from './app.error';

/** Wraps anything unexpected so internals never leak to the client. */
export class InternalServerError extends AppError {
  readonly statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  readonly code = 'INTERNAL_SERVER_ERROR';

  constructor(cause?: unknown) {
    super('An unexpected error occurred', undefined, cause);
  }
}
