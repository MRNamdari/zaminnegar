import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedResult } from '../../../common/utils/paginate';
import { Project } from '../entities/project.entity';
import { ProjectRepository } from '../repositories/project.repository';
import { ListProjectsQuery } from './list-projects.query';

@QueryHandler(ListProjectsQuery)
export class ListProjectsHandler implements IQueryHandler<ListProjectsQuery, PaginatedResult<Project>> {
  constructor(private readonly projects: ProjectRepository) {}

  execute({ dto }: ListProjectsQuery): Promise<PaginatedResult<Project>> {
    return this.projects.findPage(dto);
  }
}
