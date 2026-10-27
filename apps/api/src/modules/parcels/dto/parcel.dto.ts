import { ApiProperty } from '@nestjs/swagger';
import { MultiPolygonDto } from '../../../common/geometry/dto/multi-polygon.dto';
import type { IParcel } from '../interfaces/parcel.interface';

/** A parcel as returned by the API. */
export class ParcelDto {
  @ApiProperty({ format: 'uuid', example: 'c7a1b2f4-3d56-4e78-9a01-b2c3d4e5f607' })
  id!: string;

  @ApiProperty({ format: 'uuid', example: '5f0c8f0e-2d41-4b6a-9d4e-8a1f0c2b7e11' })
  projectId!: string;

  @ApiProperty({ example: 'North paddy' })
  name!: string;

  @ApiProperty({ type: MultiPolygonDto })
  geometry!: MultiPolygonDto;

  @ApiProperty({ example: '#2F7D4F' })
  fillColor!: string;

  @ApiProperty({ minimum: 0, maximum: 1, example: 0.35 })
  fillOpacity!: number;

  @ApiProperty({ example: '#FFFFFF' })
  strokeColor!: string;

  @ApiProperty({ example: 2 })
  strokeWidth!: number;

  @ApiProperty({ nullable: true, type: String, example: 'Irrigated from the east canal.' })
  notes!: string | null;

  @ApiProperty({ description: 'Geodesic area in square meters (PostGIS `ST_Area(geom::geography)`). An estimate, not a survey-grade value.', example: 10432.7 })
  areaM2!: number;

  @ApiProperty({ format: 'date-time', example: '2026-10-27T09:30:00.000Z' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time', example: '2026-10-27T10:05:00.000Z' })
  updatedAt!: string;

  /** Maps the domain model to its public representation. */
  static fromParcel(parcel: IParcel): ParcelDto {
    return {
      id: parcel.id,
      projectId: parcel.projectId,
      name: parcel.name,
      geometry: parcel.geometry,
      fillColor: parcel.fillColor,
      fillOpacity: parcel.fillOpacity,
      strokeColor: parcel.strokeColor,
      strokeWidth: parcel.strokeWidth,
      notes: parcel.notes,
      areaM2: parcel.areaM2,
      createdAt: parcel.createdAt.toISOString(),
      updatedAt: parcel.updatedAt.toISOString(),
    };
  }
}
