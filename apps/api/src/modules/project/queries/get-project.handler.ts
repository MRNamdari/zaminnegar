import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Project } from '../entities/project.entity';
import { ProjectNotFoundError } from '../errors/project-not-found.error';
import { ProjectRepository } from '../repositories/project.repository';
import { GetProjectQuery } from './get-project.query';

@QueryHandler(GetProjectQuery)
export class GetProjectHandler implements IQueryHandler<GetProjectQuery, Project> {
  constructor(private readonly projects: ProjectRepository) {}

  async execute({ id }: GetProjectQuery): Promise<Project> {
    const project = await this.projects.findById(id);
    if (!project) throw new ProjectNotFoundError(id);
    return project;
  }
}
