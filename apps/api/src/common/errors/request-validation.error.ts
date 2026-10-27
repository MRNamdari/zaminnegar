import { HttpStatus } from '@nestjs/common';
import { ValidationErrorDetailDto } from '../dto/validation-error-detail.dto';
import { AppError } from './app.error';

/** The request body, query or params failed validation. */
export class RequestValidationError extends AppError {
  readonly statusCode = HttpStatus.BAD_REQUEST;
  readonly code = 'REQUEST_VALIDATION_FAILED';

  constructor(details: ValidationErrorDetailDto[]) {
    super('Request validation failed', details);
  }
}
