import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiForbiddenResponse, ApiResponse, ApiUnauthorizedResponse, getSchemaPath } from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/error-response.dto';
import { ValidationErrorResponseDto } from '../dto/validation-error-response.dto';

/** 400: request validation (`ValidationErrorResponseDto`) or an application error with a `code` (`ErrorResponseDto`). */
export const ApiBadRequestErrors = (description = 'Invalid request'): MethodDecorator & ClassDecorator =>
  applyDecorators(
    ApiExtraModels(ErrorResponseDto, ValidationErrorResponseDto),
    ApiResponse({
      status: 400,
      description,
      schema: { oneOf: [{ $ref: getSchemaPath(ValidationErrorResponseDto) }, { $ref: getSchemaPath(ErrorResponseDto) }] },
    }),
  );

/** Any other error status, in the shared `{ code, message }` envelope. */
export const ApiErrorResponse = (status: 401 | 403 | 404 | 409 | 422 | 429, description: string): MethodDecorator & ClassDecorator =>
  ApiResponse({ status, description, type: ErrorResponseDto });

/** 401 and 403, which every protected operation can produce. */
export const ApiProtectedErrors = (): MethodDecorator & ClassDecorator =>
  applyDecorators(
    ApiUnauthorizedResponse({ description: 'No valid session (`NOT_AUTHENTICATED`)', type: ErrorResponseDto }),
    ApiForbiddenResponse({
      description: 'Missing permission (`PERMISSION_DENIED`, `PRIVILEGE_ESCALATION`, `FIELD_NOT_WRITABLE`) or rejected origin (`ORIGIN_NOT_ALLOWED`)',
      type: ErrorResponseDto,
    }),
  );
