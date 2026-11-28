import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance, Type } from 'class-transformer';
import { RoleScope } from '../permissions';
import type { Role } from '../entities/role.entity';
import { PermissionDto } from './permission.dto';

export class RoleResponseDto {
  @ApiProperty({ format: 'uuid' })
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty()
  @Expose()
  description!: string;

  @ApiProperty({ enum: RoleScope, enumName: 'RoleScope' })
  @Expose()
  scope!: RoleScope;

  @ApiProperty({ description: 'Predefined (seeded) roles cannot be changed or deleted' })
  @Expose()
  isSystem!: boolean;

  @ApiProperty({ type: String, format: 'uuid', nullable: true, description: 'The project a custom role belongs to; null for predefined roles' })
  @Expose()
  projectId!: string | null;

  @ApiProperty({ type: () => PermissionDto, isArray: true })
  @Expose()
  @Type(() => PermissionDto)
  permissions!: PermissionDto[];

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty()
  @Expose()
  updatedAt!: Date;

  static from(role: Role): RoleResponseDto {
    return plainToInstance(
      RoleResponseDto,
      { ...role, permissions: (role.permissions ?? []).map(({ resource, action }) => ({ resource, action })) },
      { excludeExtraneousValues: true },
    );
  }
}
