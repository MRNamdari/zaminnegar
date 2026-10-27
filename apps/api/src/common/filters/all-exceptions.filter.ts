import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ErrorResponseDto } from '../dto/error-response.dto';
import { AppError } from '../errors/app.error';
import { InternalServerError } from '../errors/internal-server.error';

/**
 * Converts every thrown value into an {@link ErrorResponseDto}:
 * {@link AppError}s keep their own status and code, framework `HttpException`s
 * (404 for unknown routes, …) are normalised, and anything else becomes a 500.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const body = this.toBody(exception, request.url);
    response.status(body.statusCode).json(body);
  }

  private toBody(exception: unknown, path: string): ErrorResponseDto {
    const base = { path, timestamp: new Date().toISOString() };

    if (exception instanceof AppError) {
      return { statusCode: exception.statusCode, code: exception.code, message: exception.message, details: exception.details, ...base };
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      return { statusCode: status, code: `HTTP_${status}`, message: exception.message, ...base };
    }
    this.logger.error('Unhandled exception', exception instanceof Error ? exception.stack : String(exception));
    const internal = new InternalServerError(exception);
    return { statusCode: internal.statusCode, code: internal.code, message: internal.message, ...base };
  }
}
