import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { BlockStatus } from '../../../common/enums/block-status.enum';
import { ProjectMismatchError } from '../../../common/errors/project-mismatch.error';
import { BoundaryGeometryService } from '../../geometry/services/boundary-geometry.service';
import { SpatialRulesService } from '../../geometry/services/spatial-rules.service';
import { ProjectNotFoundError } from '../../project/errors/project-not-found.error';
import { ProjectRepository } from '../../project/repositories/project.repository';
import { RegionNotFoundError } from '../../region/errors/region-not-found.error';
import { RegionRepository } from '../../region/repositories/region.repository';
import { Block } from '../entities/block.entity';
import { BlockNameTakenError } from '../errors/block-name-taken.error';
import { BlockRepository } from '../repositories/block.repository';
import { CreateBlockCommand } from './create-block.command';

@CommandHandler(CreateBlockCommand)
export class CreateBlockHandler implements ICommandHandler<CreateBlockCommand, Block> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly blocks: BlockRepository,
    private readonly regions: RegionRepository,
    private readonly projects: ProjectRepository,
    private readonly geometry: BoundaryGeometryService,
    private readonly spatial: SpatialRulesService,
  ) {}

  execute({ input }: CreateBlockCommand): Promise<Block> {
    return this.dataSource.transaction(async (manager) => {
      if (!(await this.projects.findById(input.projectId, manager))) throw new ProjectNotFoundError(input.projectId);

      const region = await this.regions.findById(input.regionId, manager);
      if (!region) throw new RegionNotFoundError(input.regionId);
      if (region.projectId !== input.projectId) throw new ProjectMismatchError('region', region.id);

      if (await this.blocks.findByRegionAndName(input.regionId, input.name, manager)) {
        throw new BlockNameTakenError(input.name);
      }

      const boundary = await this.geometry.acquire(
        input,
        { projectId: input.projectId, name: input.name },
        (geometry) => this.spatial.assertBlockRules(geometry, { regionId: input.regionId }, manager),
        manager,
      );

      return this.blocks.save(
        this.blocks.build({
          projectId: input.projectId,
          regionId: input.regionId,
          boundaryId: boundary.id,
          name: input.name,
          description: input.description ?? '',
          status: input.status ?? BlockStatus.active,
        }),
        manager,
      );
    });
  }
}
