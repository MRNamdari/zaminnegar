import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { ProjectNotFoundError } from '../../project/errors/project-not-found.error';
import { ProjectRepository } from '../../project/repositories/project.repository';
import { Owner } from '../entities/owner.entity';
import { OwnerRepository } from '../repositories/owner.repository';
import { CreateOwnerCommand } from './create-owner.command';

@CommandHandler(CreateOwnerCommand)
export class CreateOwnerHandler implements ICommandHandler<CreateOwnerCommand, Owner> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly owners: OwnerRepository,
    private readonly projects: ProjectRepository,
  ) {}

  execute({ dto }: CreateOwnerCommand): Promise<Owner> {
    return this.dataSource.transaction(async (manager) => {
      if (!(await this.projects.findById(dto.projectId, manager))) throw new ProjectNotFoundError(dto.projectId);
      return this.owners.save(
        this.owners.build({
          projectId: dto.projectId,
          name: dto.name,
          phone: dto.phone ?? null,
          email: dto.email ?? null,
          notes: dto.notes ?? null,
        }),
        manager,
      );
    });
  }
}
