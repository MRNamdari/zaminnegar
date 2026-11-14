import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class MapFeaturesQueryDto {
  @ApiProperty({
    format: 'uuid',
    description: 'Project whose features should be loaded',
  })
  @IsUUID()
  projectId!: string;
}
