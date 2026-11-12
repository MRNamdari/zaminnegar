import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { Action, Resource } from '../permissions';

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
