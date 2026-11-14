import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { QueryFailedError } from 'typeorm';

interface PgError {
  code?: string;
  detail?: string;
  constraint?: string;
  message: string;
}

/**
 * Turns the errors the database itself raises into the API's `{ code, message }` envelope:
 *  - 23514 raised by the reference triggers (`DETAIL` carries the code, e.g. BLOCK_NOT_IN_REGION) -> 422
 *  - 23505 unique violation (e.g. a block moved into a region that already has that name)        -> 409
 *  - 23503 foreign-key violation (deleting something still referenced)                            -> 409
 * Anything else is left to Nest's default handling (500).
 */
@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const error = exception.driverError as PgError;

    if (error.code === '23514' && error.detail && /^[A-Z_]+$/.test(error.detail)) {
      response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({ code: error.detail, message: error.message });
    } else if (error.code === '23505') {
      response.status(HttpStatus.CONFLICT).json({
        code: 'UNIQUE_VIOLATION',
        message: `Violates unique constraint ${error.constraint ?? ''}`.trim(),
      });
    } else if (error.code === '23503') {
      response.status(HttpStatus.CONFLICT).json({
        code: 'STILL_REFERENCED',
        message: `Violates foreign key ${error.constraint ?? ''}`.trim(),
      });
    } else {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ statusCode: 500, message: 'Internal server error' });
    }
  }
}
