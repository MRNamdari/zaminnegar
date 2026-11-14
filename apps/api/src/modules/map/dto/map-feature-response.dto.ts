import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, plainToInstance, Type } from 'class-transformer';
import { BlockStatus } from '../../../common/enums/block-status.enum';
import { ParcelStatus } from '../../../common/enums/parcel-status.enum';
import { RegionStatus } from '../../../common/enums/region-status.enum';
import {
  IMultiPolygon,
  Position,
} from '../../../common/interfaces/geometry.interface';
import { Block } from '../../block/entities/block.entity';
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

  @ApiProperty()
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

  @ApiProperty()
  @Expose()
  areaM2!: number;

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
    areaM2: number;
    parentId: string | null;
    status: MapFeatureStatus;
    geometry: IMultiPolygon;
  }): MapFeatureResponseDto | null {
    const [coordinates] = input.geometry.coordinates;
    if (input.geometry.coordinates.length !== 1 || !coordinates) return null;

    return plainToInstance(
      MapFeatureResponseDto,
      {
        type: 'Feature',
        id: input.id,
        geometry: { type: 'Polygon', coordinates },
        properties: {
          level: input.level,
          name: input.name,
          areaHa: input.areaM2 / 10_000,
          parentId: input.parentId,
          status: input.status,
          boundaryId: input.boundaryId,
          areaM2: input.areaM2,
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
      areaM2: region.areaM2,
      parentId: null,
      status: region.status,
      geometry: region.boundary!.geometry,
    });
  }

  static fromBlock(block: Block): MapFeatureResponseDto | null {
    return MapFeatureResponseDto.from({
      id: block.id,
      level: 'block',
      boundaryId: block.boundaryId,
      name: block.name,
      description: block.description,
      areaM2: block.areaM2,
      parentId: block.regionId,
      status: block.status,
      geometry: block.boundary!.geometry,
    });
  }

  static fromParcel(parcel: Parcel): MapFeatureResponseDto | null {
    return MapFeatureResponseDto.from({
      id: parcel.id,
      level: 'parcel',
      boundaryId: parcel.boundaryId,
      name: parcel.name,
      areaM2: parcel.areaM2,
      parentId: parcel.blockId ?? parcel.regionId,
      status: parcel.status,
      geometry: parcel.boundary!.geometry,
    });
  }
}
