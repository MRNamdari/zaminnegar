import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { MultiPolygonDto } from '../../../common/geometry/dto/multi-polygon.dto';
import { REGION_LIMITS } from '../regions.constants';

/** Body of `POST /regions`. */
export class CreateRegionDto {
  @ApiProperty({
    description: 'Unique region name.',
    minLength: 1,
    maxLength: REGION_LIMITS.nameMaxLength,
    example: 'Shaft rice paddies 2026',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(REGION_LIMITS.nameMaxLength)
  name!: string;

  @ApiPropertyOptional({
    description: 'Free-text description.',
    maxLength: REGION_LIMITS.descriptionMaxLength,
    default: '',
    example: 'Parcels surveyed during the spring planting season.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(REGION_LIMITS.descriptionMaxLength)
  description: string = '';

  @ApiProperty({
    description: 'Region territory boundary in WGS 84.',
    type: MultiPolygonDto,
  })
  @ValidateNested()
  @Type(() => MultiPolygonDto)
  territory!: MultiPolygonDto;
}
