import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';
import { Action, Resource } from '../permissions';
import type { Permission } from '../entities/permission.entity';

export class PermissionDefinitionResponseDto {
  @ApiProperty({ enum: Resource, enumName: 'Resource' })
  @Expose()
  resource!: Resource;

  @ApiProperty({ enum: Action, enumName: 'Action' })
  @Expose()
  action!: Action;

  @ApiProperty()
  @Expose()
  description!: string;

  @ApiProperty({ description: 'False when only a system role may hold the permission' })
  @Expose()
  projectAssignable!: boolean;

  static from(permission: Permission): PermissionDefinitionResponseDto {
    return plainToInstance(PermissionDefinitionResponseDto, permission, { excludeExtraneousValues: true });
  }
}
