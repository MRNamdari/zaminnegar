import { applyDecorators } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';

/** Documents a UUID path parameter (pair it with `ParseUUIDPipe`). */
export function ApiUuidParam(name: string, description: string, example: string) {
  return applyDecorators(ApiParam({ name, description, format: 'uuid', example, type: String }));
}
