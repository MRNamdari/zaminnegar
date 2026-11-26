import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ManualAreaField } from '../../../common/decorators/manual-area-field.decorator';
import { PolygonField } from '../decorators/polygon-field.decorator';
import { MAP_FEATURE_LEVELS, MAP_FEATURE_STATUSES, MapFeatureStatusValue } from '../map-feature-level';
import type { MapFeatureLevel } from './map-feature-response.dto';
import { MapPolygon } from './map-polygon';

/**
 * Creates a region, block or parcel from what the map editor draws. The project is the session's active project;
 * a block's region and a parcel's region and block are derived from the outline by the database.
 */
export class CreateMapFeatureDto {
  @ApiProperty({ enum: MAP_FEATURE_LEVELS })
  @IsIn(MAP_FEATURE_LEVELS)
  level!: MapFeatureLevel;

  @ApiProperty({ maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ description: 'Ignored for parcels, which have no description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: MAP_FEATURE_STATUSES })
  @IsOptional()
  @IsIn(MAP_FEATURE_STATUSES)
  status?: MapFeatureStatusValue;

  @PolygonField()
  geometry!: MapPolygon;

  @ManualAreaField()
  manualAreaM2?: number | null;
}
