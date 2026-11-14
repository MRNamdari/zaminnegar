import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { SpatialRulesService } from '../../geometry/services/spatial-rules.service';
import { ProjectNotFoundError } from '../../project/errors/project-not-found.error';
import { ProjectRepository } from '../../project/repositories/project.repository';
import { Boundary } from '../entities/boundary.entity';
import { BoundaryRepository } from '../repositories/boundary.repository';
import { CreateBoundaryCommand } from './create-boundary.command';

@CommandHandler(CreateBoundaryCommand)
export class CreateBoundaryHandler implements ICommandHandler<CreateBoundaryCommand, Boundary> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly boundaries: BoundaryRepository,
    private readonly projects: ProjectRepository,
    private readonly spatial: SpatialRulesService,
  ) {}

  execute({ dto }: CreateBoundaryCommand): Promise<Boundary> {
    return this.dataSource.transaction(async (manager) => {
      if (!(await this.projects.findById(dto.projectId, manager))) throw new ProjectNotFoundError(dto.projectId);
      await this.spatial.assertValid(dto.geometry, manager);
      return this.boundaries.saveAndReload(
        this.boundaries.build({ projectId: dto.projectId, name: dto.name, geometry: dto.geometry }),
        manager,
      );
    });
  }
}
