import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { RegionStatus } from '../../../common/enums/region-status.enum';
import { BoundaryGeometryService } from '../../geometry/services/boundary-geometry.service';
import { SpatialRulesService } from '../../geometry/services/spatial-rules.service';
import { ProjectNotFoundError } from '../../project/errors/project-not-found.error';
import { ProjectRepository } from '../../project/repositories/project.repository';
import { Region } from '../entities/region.entity';
import { RegionNameTakenError } from '../errors/region-name-taken.error';
import { RegionRepository } from '../repositories/region.repository';
import { CreateRegionCommand } from './create-region.command';

@CommandHandler(CreateRegionCommand)
export class CreateRegionHandler implements ICommandHandler<CreateRegionCommand, Region> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly regions: RegionRepository,
    private readonly projects: ProjectRepository,
    private readonly geometry: BoundaryGeometryService,
    private readonly spatial: SpatialRulesService,
  ) {}

  execute({ input }: CreateRegionCommand): Promise<Region> {
    return this.dataSource.transaction(async (manager) => {
      if (!(await this.projects.findById(input.projectId, manager))) throw new ProjectNotFoundError(input.projectId);
      if (await this.regions.findByProjectAndName(input.projectId, input.name, manager)) {
        throw new RegionNameTakenError(input.name);
      }

      const boundary = await this.geometry.acquire(
        input,
        { projectId: input.projectId, name: input.name },
        (geometry) => this.spatial.assertRegionRules(geometry, { projectId: input.projectId }, manager),
        manager,
      );

      return this.regions.save(
        this.regions.build({
          projectId: input.projectId,
          boundaryId: boundary.id,
          name: input.name,
          description: input.description ?? '',
          status: input.status ?? RegionStatus.active,
        }),
        manager,
      );
    });
  }
}
