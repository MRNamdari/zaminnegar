import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsMultiPolygon } from '../validators/is-multi-polygon.validator';

/** Swagger docs + validation for a GeoJSON MultiPolygon property. */
export const MultiPolygonField = (options: { optional?: boolean } = {}) =>
  applyDecorators(
    ApiProperty({
      required: !options.optional,
      type: Object.constructor,
      additionalProperties: true,
      description: 'GeoJSON MultiPolygon, WGS 84, [longitude, latitude]',
      example: {
        type: 'MultiPolygon',
        coordinates: [[[[8.68, 50.11], [8.69, 50.11], [8.69, 50.12], [8.68, 50.12], [8.68, 50.11]]]],
      },
    }),
    IsMultiPolygon(),
  );
