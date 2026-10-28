import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { BLOCK_LIMITS } from '../blocks.constants';

/** Body of `POST /regions/{regionId}/blocks`. */
export class CreateBlockDto {
  @ApiProperty({
    description: 'Block name, unique inside the region.',
    minLength: 1,
    maxLength: BLOCK_LIMITS.nameMaxLength,
    example: 'North block',
  })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(BLOCK_LIMITS.nameMaxLength)
  name!: string;

  @ApiPropertyOptional({
    description: 'Free-text description.',
    maxLength: BLOCK_LIMITS.descriptionMaxLength,
    default: '',
    example: 'Upper orchard subdivision.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(BLOCK_LIMITS.descriptionMaxLength)
  description: string = '';
}
