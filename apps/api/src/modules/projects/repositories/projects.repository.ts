import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseRepository } from '../../../common/database/base.repository';
import { handleDatabaseError } from '../../../common/database/handle-database-error';
import { PARCELS_TABLE } from '../../parcels/parcels.constants';
import { ProjectEntity } from '../entities/project.entity';
import { ProjectNameAlreadyExistsError } from '../errors/project-name-already-exists.error';
import type { ICreateProject, IProject } from '../interfaces/project.interface';
import type { IProjectWithStats } from '../interfaces/project-with-stats.interface';
import { PROJECT_CONSTRAINTS, PROJECTS_TABLE } from '../projects.constants';

/**
 * Projects with parcel count and extent. The lateral subquery runs once per
 * returned project and is served by `idx_parcels_project_id_created_at` / the GiST index.
 */
const STATS_SELECT = `
  SELECT p.id, p.name, p.description,
         p.created_at AS "createdAt", p.updated_at AS "updatedAt",
         s.parcel_count::int AS "parcelCount", s.extent
    FROM ${PROJECTS_TABLE} p
   CROSS JOIN LATERAL (
         SELECT count(*) AS parcel_count,
                CASE WHEN count(*) = 0 THEN NULL
                     ELSE ARRAY[ST_XMin(ST_Extent(c.geom)), ST_YMin(ST_Extent(c.geom)),
                                ST_XMax(ST_Extent(c.geom)), ST_YMax(ST_Extent(c.geom))]
                END AS extent
           FROM ${PARCELS_TABLE} c
          WHERE c.project_id = p.id) s`;

/** Data access for projects. Every method accepts an optional transaction `manager`. */
@Injectable()
export class ProjectsRepository extends BaseRepository<ProjectEntity> {
  constructor(@InjectRepository(ProjectEntity) repository: Repository<ProjectEntity>) {
    super(repository);
  }

  /**
   * Inserts a project.
   * @throws ProjectNameAlreadyExistsError when the name is taken.
   */
  async create(data: ICreateProject, manager?: EntityManager): Promise<IProject> {
    const repository = this.getRepository(manager);
    try {
      return await repository.save(repository.create(data));
    } catch (error) {
      return handleDatabaseError(error, {
        [PROJECT_CONSTRAINTS.uniqueName]: () => new ProjectNameAlreadyExistsError(data.name),
      });
    }
  }

  /** @returns The project with aggregates, or `null` when it does not exist. */
  async findByIdWithStats(id: string, manager?: EntityManager): Promise<IProjectWithStats | null> {
    const rows: IProjectWithStats[] = await this.getManager(manager).query(`${STATS_SELECT} WHERE p.id = $1`, [id]);
    return rows[0] ?? null;
  }

  /** Most recently changed projects first (served by `idx_projects_updated_at`). */
  async findAllWithStats(limit: number, offset: number, manager?: EntityManager): Promise<IProjectWithStats[]> {
    return this.getManager(manager).query(`${STATS_SELECT} ORDER BY p.updated_at DESC, p.id LIMIT $1 OFFSET $2`, [limit, offset]);
  }

  /** Total number of projects. */
  async count(manager?: EntityManager): Promise<number> {
    return this.getRepository(manager).count();
  }
}
