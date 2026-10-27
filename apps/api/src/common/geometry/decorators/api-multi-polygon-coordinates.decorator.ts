import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';

/** Four nested arrays: polygons → rings → positions → numbers. */
const COORDINATES_SCHEMA = {
  type: 'array',
  items: {
    type: 'array',
    items: {
      type: 'array',
      items: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2 },
    },
  },
} as const;

/**
 * Swagger description of MultiPolygon `coordinates`, shared by every DTO that carries one.
 * Positions are `[longitude, latitude]` in EPSG:4326.
 */
export function ApiMultiPolygonCoordinates() {
  return applyDecorators(
    ApiProperty({
      ...COORDINATES_SCHEMA,
      description: 'Polygons → rings → `[longitude, latitude]` positions (WGS 84). Rings must be closed.',
      example: [
        [
          [
            [49.6, 37.3],
            [49.61, 37.3],
            [49.61, 37.31],
            [49.6, 37.31],
            [49.6, 37.3],
          ],
        ],
      ],
    } as ApiPropertyOptions),
  );
}
