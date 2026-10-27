import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';
import { MultiPolygonDto } from '../../../common/geometry/dto/multi-polygon.dto';
import { HEX_COLOR_PATTERN, PARCEL_DEFAULTS, PARCEL_LIMITS } from '../parcels.constants';

/** Body of `POST /projects/{projectId}/parcels`. */
export class CreateParcelDto {
  @ApiProperty({ description: 'Parcel name, unique inside the project.', maxLength: PARCEL_LIMITS.nameMaxLength, example: 'North paddy' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(PARCEL_LIMITS.nameMaxLength)
  name!: string;

  @ApiProperty({ description: 'Parcel boundary in WGS 84. Self-intersecting polygons are rejected with 422.', type: MultiPolygonDto })
  @ValidateNested()
  @Type(() => MultiPolygonDto)
  geometry!: MultiPolygonDto;

  @ApiPropertyOptional({ description: 'Fill color as `#RRGGBB`.', pattern: '^#[0-9A-Fa-f]{6}$', default: PARCEL_DEFAULTS.fillColor, example: '#2F7D4F' })
  @IsOptional()
  @Matches(HEX_COLOR_PATTERN, { message: 'fillColor must be a #RRGGBB color' })
  fillColor?: string;

  @ApiPropertyOptional({ description: 'Fill opacity.', minimum: 0, maximum: 1, default: PARCEL_DEFAULTS.fillOpacity, example: 0.35 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  fillOpacity?: number;

  @ApiPropertyOptional({ description: 'Boundary color as `#RRGGBB`.', pattern: '^#[0-9A-Fa-f]{6}$', default: PARCEL_DEFAULTS.strokeColor, example: '#FFFFFF' })
  @IsOptional()
  @Matches(HEX_COLOR_PATTERN, { message: 'strokeColor must be a #RRGGBB color' })
  strokeColor?: string;

  @ApiPropertyOptional({ description: 'Boundary width in pixels.', minimum: PARCEL_LIMITS.strokeWidthMin, maximum: PARCEL_LIMITS.strokeWidthMax, default: PARCEL_DEFAULTS.strokeWidth, example: 2 })
  @IsOptional()
  @IsNumber()
  @Min(PARCEL_LIMITS.strokeWidthMin)
  @Max(PARCEL_LIMITS.strokeWidthMax)
  strokeWidth?: number;

  @ApiPropertyOptional({ description: 'Free-text notes; `null` clears them.', nullable: true, type: String, maxLength: PARCEL_LIMITS.notesMaxLength, example: 'Irrigated from the east canal.' })
  @IsOptional()
  @IsString()
  @MaxLength(PARCEL_LIMITS.notesMaxLength)
  notes?: string | null;
}
