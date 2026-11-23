import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { PolygonField } from '../decorators/polygon-field.decorator';
import { MAP_FEATURE_STATUSES, MapFeatureStatusValue } from '../map-feature-level';
import { MapPolygon } from './map-polygon';

/**
 * Changes a feature of any level. Every field is optional and only the fields that are sent change; nothing is
 * defaulted, so a request that carries only a geometry leaves the name, description and status alone.
 */
export class UpdateMapFeatureDto {
  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ description: 'Ignored for parcels, which have no description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: MAP_FEATURE_STATUSES })
  @IsOptional()
  @IsIn(MAP_FEATURE_STATUSES)
  status?: MapFeatureStatusValue;

  @PolygonField({ optional: true })
  @IsOptional()
  geometry?: MapPolygon;
}
