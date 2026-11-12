import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseRepository } from '../../../common/base/base.repository';
import { applyProjectScope } from '../../../common/utils/project-scope';
import { escapeLike, paginate, PaginatedResult } from '../../../common/utils/paginate';
import { ProjectQueryDto } from '../dto/project-query.dto';
import { Project } from '../entities/project.entity';

@Injectable()
export class ProjectRepository extends BaseRepository<Project> {
  constructor(@InjectRepository(Project) repository: Repository<Project>) {
    super(repository);
  }

  findByName(name: string, manager?: EntityManager): Promise<Project | null> {
    return this.repo(manager).findOne({ where: { name } });
  }

  findPage(query: ProjectQueryDto, projectScope: string[] | null = null): Promise<PaginatedResult<Project>> {
    const qb = this.repository.createQueryBuilder('project');
    applyProjectScope(qb, 'project.id', projectScope);
    if (query.search) {
      qb.andWhere(`project.name ILIKE :search ESCAPE '\\'`, { search: `%${escapeLike(query.search)}%` });
    }
    return paginate(qb.orderBy('project.createdAt', 'DESC').addOrderBy('project.id', 'ASC'), query);
  }

  /** True when the project still owns regions, boundaries or owners (blocks and parcels hang off regions). */
  async hasContent(id: string, manager?: EntityManager): Promise<boolean> {
    const em = manager ?? this.repository.manager;
    const rows: Array<{ has_content: boolean }> = await em.query(
      `SELECT (
         EXISTS (SELECT 1 FROM regions WHERE project_id = $1)
         OR EXISTS (SELECT 1 FROM boundaries WHERE project_id = $1)
         OR EXISTS (SELECT 1 FROM owners WHERE project_id = $1)
       ) AS has_content`,
      [id],
    );
    return rows[0]?.has_content === true;
  }
}
