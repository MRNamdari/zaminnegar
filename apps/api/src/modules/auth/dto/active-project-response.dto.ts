import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';

export class ActiveProjectResponseDto {
  @ApiProperty({ format: 'uuid' })
  @Expose()
  projectId!: string;

  static of(projectId: string): ActiveProjectResponseDto {
    return plainToInstance(ActiveProjectResponseDto, { projectId }, { excludeExtraneousValues: true });
  }
}
