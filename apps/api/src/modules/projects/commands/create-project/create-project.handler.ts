import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionService } from '../../../../common/database/transaction.service';
import { ProjectNotFoundError } from '../../errors/project-not-found.error';
import type { IProjectWithStats } from '../../interfaces/project-with-stats.interface';
import { ProjectsRepository } from '../../repositories/projects.repository';
import { CreateProjectCommand } from './create-project.command';

@CommandHandler(CreateProjectCommand)
export class CreateProjectHandler implements ICommandHandler<CreateProjectCommand> {
  constructor(
    private readonly projects: ProjectsRepository,
    private readonly transactions: TransactionService,
  ) {}

  async execute({ name, description }: CreateProjectCommand): Promise<IProjectWithStats> {
    return this.transactions.run(async (manager) => {
      const project = await this.projects.create({ name, description }, manager);
      const withStats = await this.projects.findByIdWithStats(project.id, manager);
      if (!withStats) throw new ProjectNotFoundError(project.id);
      return withStats;
    });
  }
}
