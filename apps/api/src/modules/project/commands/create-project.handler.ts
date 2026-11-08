import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Project } from '../entities/project.entity';
import { ProjectNameTakenError } from '../errors/project-name-taken.error';
import { ProjectRepository } from '../repositories/project.repository';
import { CreateProjectCommand } from './create-project.command';

@CommandHandler(CreateProjectCommand)
export class CreateProjectHandler implements ICommandHandler<CreateProjectCommand, Project> {
  constructor(private readonly projects: ProjectRepository) {}

  async execute({ dto }: CreateProjectCommand): Promise<Project> {
    if (await this.projects.findByName(dto.name)) throw new ProjectNameTakenError(dto.name);
    return this.projects.save(this.projects.build({ name: dto.name, description: dto.description ?? '' }));
  }
}
