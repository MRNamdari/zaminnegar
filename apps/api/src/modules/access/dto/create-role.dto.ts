import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsString, Length, MaxLength, ValidateNested } from 'class-validator';
import { DefinedIfPresent } from '../validators/defined-if-present.decorator';
import { PermissionDto } from './permission.dto';

const trim = ({ value }: { value: unknown }): unknown => (typeof value === 'string' ? value.trim() : value);

export class CreateRoleDto {
  @ApiProperty({ minLength: 2, maxLength: 100, example: 'surveyor' })
  @Transform(trim)
  @IsString()
  @Length(2, 100)
  name!: string;

  @ApiPropertyOptional({ maxLength: 500, default: '' })
  @DefinedIfPresent()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ type: () => PermissionDto, isArray: true, maxItems: 100, description: 'Only permissions a project role may hold, and only ones you hold yourself' })
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permissions!: PermissionDto[];
}
