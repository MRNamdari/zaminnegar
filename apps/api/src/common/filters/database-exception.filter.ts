import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
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
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: QueryFailedError, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const response: unknown = host.switchToHttp().getResponse();
    const error = exception.driverError as PgError;

    if (error.code === '23514' && error.detail && /^[A-Z_]+$/.test(error.detail)) {
      httpAdapter.reply(
        response,
        { code: error.detail, message: error.message },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    } else if (error.code === '23505') {
      httpAdapter.reply(
        response,
        {
          code: 'UNIQUE_VIOLATION',
          message: `Violates unique constraint ${error.constraint ?? ''}`.trim(),
        },
        HttpStatus.CONFLICT,
      );
    } else if (error.code === '23503') {
      httpAdapter.reply(
        response,
        {
          code: 'STILL_REFERENCED',
          message: `Violates foreign key ${error.constraint ?? ''}`.trim(),
        },
        HttpStatus.CONFLICT,
      );
    } else {
      httpAdapter.reply(
        response,
        { statusCode: 500, message: 'Internal server error' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
