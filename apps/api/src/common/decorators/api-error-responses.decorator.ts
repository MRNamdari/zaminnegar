import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/error-response.dto';

const DESCRIPTIONS: Record<number, string> = {
  400: 'The request failed validation (details contain per-field messages).',
  404: 'The requested resource does not exist.',
  409: 'The request conflicts with existing data (e.g. duplicate name).',
  422: 'The request was well-formed but semantically invalid (e.g. an invalid polygon).',
  500: 'Unexpected server error.',
};

/**
 * Documents the given error statuses with the shared {@link ErrorResponseDto}.
 * A 500 response is always included.
 *
 * @example
 * @ApiErrorResponses(400, 404)
 */
export function ApiErrorResponses(...statuses: Array<400 | 404 | 409 | 422>) {
  return applyDecorators(
    ...[...statuses, 500].map((status) =>
      ApiResponse({ status, description: DESCRIPTIONS[status], type: ErrorResponseDto }),
    ),
  );
}
