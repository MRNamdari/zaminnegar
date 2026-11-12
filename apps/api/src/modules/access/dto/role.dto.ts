import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Expose, plainToInstance, Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Action, Resource, RoleScope } from '../permissions';
import { PermissionDto } from './permission.dto';

export class RoleResponseDto {
  @ApiProperty({ format: 'uuid' }) @Expose() id!: string;
  @ApiProperty() @Expose() name!: string;
  @ApiProperty() @Expose() description!: string;
  @ApiProperty({ enum: RoleScope, enumName: 'RoleScope' }) @Expose() scope!: RoleScope;
  @ApiProperty({ description: 'System roles are seeded and cannot be changed or deleted' }) @Expose() isSystem!: boolean;
  @ApiProperty({ type: () => PermissionDto, isArray: true })
  @Expose()
  @Type(() => PermissionDto)
  permissions!: PermissionDto[];
  @ApiProperty() @Expose() createdAt!: Date;
  @ApiProperty() @Expose() updatedAt!: Date;

  static from(role: Omit<RoleResponseDto, 'permissions'> & { permissions?: Array<{ resource: Resource; action: Action }> }): RoleResponseDto {
    return plainToInstance(RoleResponseDto, { ...role, permissions: role.permissions ?? [] }, { excludeExtraneousValues: true });
  }
}

export class CreateRoleDto {
  @ApiProperty({ maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ default: '' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: RoleScope,
    enumName: 'RoleScope',
    description: '`global` roles are assigned to a user once; `project` roles are assigned per project',
  })
  @IsEnum(RoleScope)
  scope!: RoleScope;

  @ApiProperty({ type: () => PermissionDto, isArray: true, maxItems: 100 })
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permissions!: PermissionDto[];
}

/** The scope of a role is fixed at creation. */
export class UpdateRoleDto extends PartialType(OmitType(CreateRoleDto, ['scope'] as const)) {}
