import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { Action, Resource } from '../permissions';

/** A permission: one action on one resource. Request item and response item. */
export class PermissionDto {
  @ApiProperty({ enum: Resource, enumName: 'Resource' })
  @Expose()
  @IsEnum(Resource)
  resource!: Resource;

  @ApiProperty({ enum: Action, enumName: 'Action' })
  @Expose()
  @IsEnum(Action)
  action!: Action;
}
