import { ApiProperty } from '@nestjs/swagger';

/** Non-geometric attributes of an exported parcel. */
export class ParcelFeaturePropertiesDto {
  @ApiProperty({ format: 'uuid', example: 'c7a1b2f4-3d56-4e78-9a01-b2c3d4e5f607' })
  id!: string;

  @ApiProperty({ example: 'North paddy' })
  name!: string;

  @ApiProperty({ example: '#2F7D4F' })
  fillColor!: string;

  @ApiProperty({ example: 0.35 })
  fillOpacity!: number;

  @ApiProperty({ example: '#FFFFFF' })
  strokeColor!: string;

  @ApiProperty({ example: 2 })
  strokeWidth!: number;

  @ApiProperty({ nullable: true, type: String, example: null })
  notes!: string | null;

  @ApiProperty({ description: 'Geodesic area in square meters.', example: 10432.7 })
  areaM2!: number;

  @ApiProperty({ description: 'Geodesic area in hectares.', example: 1.04327 })
  areaHectares!: number;

  @ApiProperty({ format: 'date-time', example: '2026-10-27T09:30:00.000Z' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time', example: '2026-10-27T10:05:00.000Z' })
  updatedAt!: string;
}
