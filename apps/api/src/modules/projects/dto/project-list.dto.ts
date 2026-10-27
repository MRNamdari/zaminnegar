import { ApiProperty } from '@nestjs/swagger';
import { ProjectDto } from './project.dto';

/** One page of projects. */
export class ProjectListDto {
  @ApiProperty({ type: [ProjectDto] })
  items!: ProjectDto[];

  @ApiProperty({ description: 'Total number of projects, ignoring pagination.', example: 3 })
  total!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 0 })
  offset!: number;
}
