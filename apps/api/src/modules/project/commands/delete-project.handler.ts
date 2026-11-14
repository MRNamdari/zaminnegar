import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { ProjectNotEmptyError } from '../errors/project-not-empty.error';
import { ProjectNotFoundError } from '../errors/project-not-found.error';
import { ProjectRepository } from '../repositories/project.repository';
import { DeleteProjectCommand } from './delete-project.command';

@CommandHandler(DeleteProjectCommand)
export class DeleteProjectHandler implements ICommandHandler<DeleteProjectCommand, void> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly projects: ProjectRepository,
  ) {}

  async execute({ id }: DeleteProjectCommand): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      if (!(await this.projects.findById(id, manager))) throw new ProjectNotFoundError(id);
      if (await this.projects.hasContent(id, manager)) throw new ProjectNotEmptyError(id);
      await this.projects.deleteById(id, manager);
    });
  }
}
