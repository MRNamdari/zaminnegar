import { ApiProperty } from '@nestjs/swagger';
import { Equals } from 'class-validator';
import { ApiMultiPolygonCoordinates } from '../decorators/api-multi-polygon-coordinates.decorator';
import type { IMultiPolygon, Position } from '../interfaces/multi-polygon.interface';
import { IsMultiPolygonCoordinates } from '../validators/is-multi-polygon-coordinates.validator';

/** GeoJSON MultiPolygon in WGS 84 (EPSG:4326), coordinates ordered `[longitude, latitude]`. */
export class MultiPolygonDto implements IMultiPolygon {
  @ApiProperty({ enum: ['MultiPolygon'], example: 'MultiPolygon' })
  @Equals('MultiPolygon')
  type!: 'MultiPolygon';

  @ApiMultiPolygonCoordinates()
  @IsMultiPolygonCoordinates()
  coordinates!: Position[][][];
}
