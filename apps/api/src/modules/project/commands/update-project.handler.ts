import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Project } from '../entities/project.entity';
import { ProjectNameTakenError } from '../errors/project-name-taken.error';
import { ProjectNotFoundError } from '../errors/project-not-found.error';
import { ProjectRepository } from '../repositories/project.repository';
import { UpdateProjectCommand } from './update-project.command';

@CommandHandler(UpdateProjectCommand)
export class UpdateProjectHandler implements ICommandHandler<UpdateProjectCommand, Project> {
  constructor(private readonly projects: ProjectRepository) {}

  async execute({ id, dto }: UpdateProjectCommand): Promise<Project> {
    const project = await this.projects.findById(id);
    if (!project) throw new ProjectNotFoundError(id);

    if (dto.name !== undefined && dto.name !== project.name) {
      const existing = await this.projects.findByName(dto.name);
      if (existing && existing.id !== project.id) throw new ProjectNameTakenError(dto.name);
      project.name = dto.name;
    }
    if (dto.description !== undefined) project.description = dto.description;

    return this.projects.save(project);
  }
}
