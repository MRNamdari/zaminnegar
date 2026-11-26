import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, plainToInstance, Type } from 'class-transformer';
import { BlockStatus } from '../../../common/enums/block-status.enum';
import { ParcelStatus } from '../../../common/enums/parcel-status.enum';
import { RegionStatus } from '../../../common/enums/region-status.enum';
import { Position } from '../../../common/interfaces/geometry.interface';
import { effectiveAreaM2 } from '../../../common/utils/effective-area';
import { Block } from '../../block/entities/block.entity';
import { Boundary } from '../../boundary/entities/boundary.entity';
import { Parcel } from '../../parcel/entities/parcel.entity';
import { Region } from '../../region/entities/region.entity';

export type MapFeatureLevel = 'region' | 'block' | 'parcel';
export type MapFeatureStatus = RegionStatus | BlockStatus | ParcelStatus;

export class MapFeatureGeometryResponseDto {
  @ApiProperty({ enum: ['Polygon'] })
  @Expose()
  type!: 'Polygon';

  @ApiProperty({
    type: 'array',
    items: {
      type: 'array',
      items: {
        type: 'array',
        items: { type: 'number' },
      },
    },
  })
  @Expose()
  coordinates!: Position[][];
}

export class MapFeaturePropertiesResponseDto {
  @ApiProperty({ enum: ['region', 'block', 'parcel'] })
  @Expose()
  level!: MapFeatureLevel;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty({ description: 'areaM2 in hectares' })
  @Expose()
  areaHa!: number;

  @ApiProperty({ type: 'string', format: 'uuid', nullable: true })
  @Expose()
  parentId!: string | null;

  @ApiProperty({ format: 'uuid' })
  @Expose()
  boundaryId!: string;

  @ApiProperty({ enum: ['active', 'inactive'] })
  @Expose()
  status!: MapFeatureStatus;

  @ApiProperty({ description: "The boundary's manualAreaM2 when set, otherwise its computedAreaM2" })
  @Expose()
  areaM2!: number;

  @ApiProperty({ description: 'Geodesic area computed from the geometry' })
  @Expose()
  computedAreaM2!: number;

  @ApiProperty({ type: 'number', nullable: true, description: 'Area assigned by the user; null when none was supplied' })
  @Expose()
  manualAreaM2!: number | null;

  @ApiPropertyOptional()
  @Expose()
  description?: string;
}

export class MapFeatureResponseDto {
  @ApiProperty({ enum: ['Feature'] })
  @Expose()
  type!: 'Feature';

  @ApiProperty({ format: 'uuid' })
  @Expose()
  id!: string;

  @ApiProperty({ type: MapFeatureGeometryResponseDto })
  @Expose()
  @Type(() => MapFeatureGeometryResponseDto)
  geometry!: MapFeatureGeometryResponseDto;

  @ApiProperty({ type: MapFeaturePropertiesResponseDto })
  @Expose()
  @Type(() => MapFeaturePropertiesResponseDto)
  properties!: MapFeaturePropertiesResponseDto;

  private static from(input: {
    id: string;
    level: MapFeatureLevel;
    boundaryId: string;
    name: string;
    description?: string;
    parentId: string | null;
    status: MapFeatureStatus;
    /** The feature's boundary: the single source of its geometry and areas. */
    boundary: Pick<Boundary, 'geometry' | 'computedAreaM2' | 'manualAreaM2'>;
  }): MapFeatureResponseDto | null {
    const { geometry, computedAreaM2, manualAreaM2 } = input.boundary;
    const [coordinates] = geometry.coordinates;
    if (geometry.coordinates.length !== 1 || !coordinates) return null;
    const areaM2 = effectiveAreaM2(input.boundary);

    return plainToInstance(
      MapFeatureResponseDto,
      {
        type: 'Feature',
        id: input.id,
        geometry: { type: 'Polygon', coordinates },
        properties: {
          level: input.level,
          name: input.name,
          areaHa: areaM2 / 10_000,
          parentId: input.parentId,
          status: input.status,
          boundaryId: input.boundaryId,
          areaM2,
          computedAreaM2,
          manualAreaM2,
          ...(input.description !== undefined
            ? { description: input.description }
            : {}),
        },
      },
      { excludeExtraneousValues: true },
    );
  }

  static fromRegion(region: Region): MapFeatureResponseDto | null {
    return MapFeatureResponseDto.from({
      id: region.id,
      level: 'region',
      boundaryId: region.boundaryId,
      name: region.name,
      description: region.description,
      parentId: null,
      status: region.status,
      boundary: region.boundary!,
    });
  }

  static fromBlock(block: Block): MapFeatureResponseDto | null {
    return MapFeatureResponseDto.from({
      id: block.id,
      level: 'block',
      boundaryId: block.boundaryId,
      name: block.name,
      description: block.description,
      parentId: block.regionId,
      status: block.status,
      boundary: block.boundary!,
    });
  }

  static fromParcel(parcel: Parcel): MapFeatureResponseDto | null {
    return MapFeatureResponseDto.from({
      id: parcel.id,
      level: 'parcel',
      boundaryId: parcel.boundaryId,
      name: parcel.name,
      parentId: parcel.blockId ?? parcel.regionId,
      status: parcel.status,
      boundary: parcel.boundary!,
    });
  }
}
