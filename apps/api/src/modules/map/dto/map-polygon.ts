import { ApiProperty } from '@nestjs/swagger';
import type { Position } from '../../../common/interfaces/geometry.interface';

/**
 * A GeoJSON Polygon as the map API reads and writes it. Declared as a class so the OpenAPI document lists both
 * members as required; the shape itself is validated by `IsPolygon`, not by this class.
 */
export class MapPolygon {
  @ApiProperty({ enum: ['Polygon'] })
  type!: 'Polygon';

  @ApiProperty({
    description: 'Rings of [longitude, latitude]. The first ring is the outline, later rings are holes. Rings are closed.',
    type: 'array',
    items: { type: 'array', items: { type: 'array', items: { type: 'number' } } },
    example: [
      [
        [8.68, 50.11],
        [8.69, 50.11],
        [8.69, 50.12],
        [8.68, 50.12],
        [8.68, 50.11],
      ],
    ],
  })
  coordinates!: Position[][];
}
