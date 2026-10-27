import { HttpStatus } from '@nestjs/common';
import { AppError } from '../../../common/errors/app.error';

/** The polygon is well-formed JSON but topologically invalid (e.g. self-intersecting) or degenerate. */
export class InvalidGeometryError extends AppError {
  readonly statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
  readonly code = 'INVALID_GEOMETRY';

  constructor(reason: string) {
    super(`Invalid polygon: ${reason}`, { reason });
  }
}
