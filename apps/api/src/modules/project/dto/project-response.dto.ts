import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';
import { IProject } from '../../../common/interfaces/project.interface';

export class ProjectResponseDto {
  @ApiProperty({ format: 'uuid' }) @Expose() id!: string;
  @ApiProperty() @Expose() name!: string;
  @ApiProperty() @Expose() description!: string;
  @ApiProperty() @Expose() createdAt!: Date;
  @ApiProperty() @Expose() updatedAt!: Date;

  static from(project: IProject): ProjectResponseDto {
    return plainToInstance(ProjectResponseDto, project, { excludeExtraneousValues: true });
  }
}
