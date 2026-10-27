import { ApiProperty } from '@nestjs/swagger';
import type { BoundingBox } from '../../../common/geometry/interfaces/multi-polygon.interface';
import type { IProjectWithStats } from '../interfaces/project-with-stats.interface';

/** A project as returned by the API. */
export class ProjectDto {
  @ApiProperty({ format: 'uuid', example: '5f0c8f0e-2d41-4b6a-9d4e-8a1f0c2b7e11' })
  id!: string;

  @ApiProperty({ example: 'Shaft rice paddies 2026' })
  name!: string;

  @ApiProperty({ example: 'Parcels surveyed during the spring planting season.' })
  description!: string;

  @ApiProperty({ description: 'Number of parcels in the project.', example: 12 })
  parcelCount!: number;

  @ApiProperty({
    description: 'Bounding box `[west, south, east, north]` of all parcels; `null` while the project is empty.',
    type: [Number],
    minItems: 4,
    maxItems: 4,
    nullable: true,
    example: [49.59, 37.29, 49.62, 37.32],
  })
  extent!: BoundingBox | null;

  @ApiProperty({ format: 'date-time', example: '2026-10-27T09:30:00.000Z' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time', description: 'Also bumped whenever a parcel of the project changes.', example: '2026-10-27T10:05:00.000Z' })
  updatedAt!: string;

  /** Maps the domain model to its public representation. */
  static fromProject(project: IProjectWithStats): ProjectDto {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      parcelCount: project.parcelCount,
      extent: project.extent,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    };
  }
}
