import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { PROJECT_LIMITS } from '../projects.constants';

/** Body of `POST /projects`. */
export class CreateProjectDto {
  @ApiProperty({
    description: 'Unique project name.',
    minLength: 1,
    maxLength: PROJECT_LIMITS.nameMaxLength,
    example: 'Shaft rice paddies 2026',
  })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(PROJECT_LIMITS.nameMaxLength)
  name!: string;

  @ApiPropertyOptional({
    description: 'Free-text description.',
    maxLength: PROJECT_LIMITS.descriptionMaxLength,
    default: '',
    example: 'Parcels surveyed during the spring planting season.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(PROJECT_LIMITS.descriptionMaxLength)
  description: string = '';
}
