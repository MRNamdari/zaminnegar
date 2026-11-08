import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';

/** Swagger docs for a `PaginatedResponseDto<Model>` response. */
export const ApiPaginatedResponse = (model: Type<unknown>) =>
  applyDecorators(
    ApiExtraModels(PaginatedResponseDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedResponseDto) },
          { properties: { items: { type: 'array', items: { $ref: getSchemaPath(model) } } } },
        ],
      },
    }),
  );
