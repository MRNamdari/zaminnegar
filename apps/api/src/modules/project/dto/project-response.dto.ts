import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';
import { IProject } from '../../../common/interfaces/project.interface';

export class ProjectResponseDto {
  @ApiProperty({ format: 'uuid' }) @Expose() id!: string;
  @ApiProperty({type:'string'}) @Expose() name!: string;
  @ApiProperty({type:'string'}) @Expose() description!: string;
  @ApiProperty() @Expose() createdAt!: Date;
  @ApiProperty() @Expose() updatedAt!: Date;
  @ApiProperty({type: 'number'}) @Expose() ownersCount!: number;
  @ApiProperty({type: 'number'}) @Expose() regionsCount!: number;
  @ApiProperty({type: 'number'}) @Expose() blocksCount!: number;
  @ApiProperty({type: 'number'}) @Expose() parcelsCount!: number;

  static from(project: IProject): ProjectResponseDto {
    return plainToInstance(ProjectResponseDto, project, { excludeExtraneousValues: true });
  }
}
