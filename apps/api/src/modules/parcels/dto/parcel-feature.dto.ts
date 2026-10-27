import { ApiProperty } from '@nestjs/swagger';
import { MultiPolygonDto } from '../../../common/geometry/dto/multi-polygon.dto';
import { ParcelFeaturePropertiesDto } from './parcel-feature-properties.dto';

/** One parcel as an RFC 7946 GeoJSON Feature. */
export class ParcelFeatureDto {
  @ApiProperty({ enum: ['Feature'], example: 'Feature' })
  type!: 'Feature';

  @ApiProperty({ format: 'uuid', description: 'Same as `properties.id`.', example: 'c7a1b2f4-3d56-4e78-9a01-b2c3d4e5f607' })
  id!: string;

  @ApiProperty({ type: MultiPolygonDto })
  geometry!: MultiPolygonDto;

  @ApiProperty({ type: ParcelFeaturePropertiesDto })
  properties!: ParcelFeaturePropertiesDto;
}
