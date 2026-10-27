import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { IPaginated } from '../../../../common/interfaces/paginated.interface';
import type { IProjectWithStats } from '../../interfaces/project-with-stats.interface';
import { ProjectsRepository } from '../../repositories/projects.repository';
import { ListProjectsQuery } from './list-projects.query';

@QueryHandler(ListProjectsQuery)
export class ListProjectsHandler implements IQueryHandler<ListProjectsQuery> {
  constructor(private readonly projects: ProjectsRepository) {}

  async execute({ limit, offset }: ListProjectsQuery): Promise<IPaginated<IProjectWithStats>> {
    const [items, total] = await Promise.all([this.projects.findAllWithStats(limit, offset), this.projects.count()]);
    return { items, total };
  }
}
