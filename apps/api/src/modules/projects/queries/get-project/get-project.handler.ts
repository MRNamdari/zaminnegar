import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ProjectNotFoundError } from '../../errors/project-not-found.error';
import type { IProjectWithStats } from '../../interfaces/project-with-stats.interface';
import { ProjectsRepository } from '../../repositories/projects.repository';
import { GetProjectQuery } from './get-project.query';

@QueryHandler(GetProjectQuery)
export class GetProjectHandler implements IQueryHandler<GetProjectQuery> {
  constructor(private readonly projects: ProjectsRepository) {}

  async execute({ projectId }: GetProjectQuery): Promise<IProjectWithStats> {
    const project = await this.projects.findByIdWithStats(projectId);
    if (!project) throw new ProjectNotFoundError(projectId);
    return project;
  }
}
