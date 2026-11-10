import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsMultiPolygon } from '../validators/is-multi-polygon.validator';

export const MultiPolygonField = (options: { optional?: boolean } = {}) =>
  applyDecorators(
    ApiProperty({
      required: !options.optional,
      description: 'GeoJSON MultiPolygon, WGS 84, [longitude, latitude]',
      example: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [8.68, 50.11],
              [8.69, 50.11],
              [8.69, 50.12],
              [8.68, 50.12],
              [8.68, 50.11],
            ],
          ],
        ],
      },
      type: Object,
      additionalProperties: false,
      properties: {
        type: {
          type: 'string',
          enum: ['MultiPolygon', 'Polygon'],
        },
        coordinates: {
          type: 'array',
          items: {
            type: 'array',
            items: {
              type: 'array',
              items: {
                type: 'array',
                items: { type: 'number' },
              },
            },
          },
        },
      },
    } as ApiPropertyOptions),
    IsMultiPolygon(),
  );
