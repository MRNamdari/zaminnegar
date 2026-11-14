import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class SetActiveProjectDto {
  @ApiProperty({ format: 'uuid', description: 'A project you are a member of (or can read at system level)' })
  @IsUUID()
  projectId!: string;
}
