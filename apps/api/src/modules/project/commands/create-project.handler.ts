import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { ProjectMembershipService } from '../../access/services/project-membership.service';
import { Project } from '../entities/project.entity';
import { ProjectNameTakenError } from '../errors/project-name-taken.error';
import { ProjectRepository } from '../repositories/project.repository';
import { CreateProjectCommand } from './create-project.command';

@CommandHandler(CreateProjectCommand)
export class CreateProjectHandler implements ICommandHandler<CreateProjectCommand, Project> {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly dataSource: DataSource,
    private readonly membership: ProjectMembershipService,
  ) {}

  async execute({ dto, creatorId }: CreateProjectCommand): Promise<Project> {
    if (await this.projects.findByName(dto.name)) throw new ProjectNameTakenError(dto.name);
    // One transaction: a project never exists without its owner.
    return this.dataSource.transaction(async (manager) => {
      const project = await this.projects.save(this.projects.build({ name: dto.name, description: dto.description ?? '' }), manager);
      await this.membership.addOwner(manager, project.id, creatorId);
      return project;
    });
  }
}
