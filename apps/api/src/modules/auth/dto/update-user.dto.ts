import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsUUID, ValidateIf } from 'class-validator';
import { DefinedIfPresent } from '../validators/defined-if-present.decorator';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Deactivating an account also ends its session' })
  @DefinedIfPresent()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: String, format: 'uuid', nullable: true, description: 'A system role, or null to remove it' })
  @ValidateIf((_object, value: unknown) => value !== undefined && value !== null)
  @IsUUID()
  systemRoleId?: string | null;
}
