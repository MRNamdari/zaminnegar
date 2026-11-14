import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { BlockStatus } from '../../../common/enums/block-status.enum';
import { BoundaryGeometryService } from '../../geometry/services/boundary-geometry.service';
import { SpatialRulesService } from '../../geometry/services/spatial-rules.service';
import { ProjectNotFoundError } from '../../project/errors/project-not-found.error';
import { ProjectRepository } from '../../project/repositories/project.repository';
import { Block } from '../entities/block.entity';
import { BlockNameTakenError } from '../errors/block-name-taken.error';
import { BlockRepository } from '../repositories/block.repository';
import { CreateBlockCommand } from './create-block.command';

/**
 * The region is not an input: the database assigns `region_id` (trigger `trg_blocks_assign_region`) from the
 * block's outline. The handler resolves the same region up front only to apply the sibling rules and the
 * name-uniqueness check (unique per region) before anything is written.
 */
@CommandHandler(CreateBlockCommand)
export class CreateBlockHandler implements ICommandHandler<CreateBlockCommand, Block> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly blocks: BlockRepository,
    private readonly projects: ProjectRepository,
    private readonly geometry: BoundaryGeometryService,
    private readonly spatial: SpatialRulesService,
  ) {}

  execute({ input }: CreateBlockCommand): Promise<Block> {
    return this.dataSource.transaction(async (manager) => {
      if (!(await this.projects.findById(input.projectId, manager))) throw new ProjectNotFoundError(input.projectId);

      const boundary = await this.geometry.acquire(
        input,
        { projectId: input.projectId, name: input.name },
        async (geometry) => {
          const regionId = await this.spatial.resolveRegionId('block', geometry, input.projectId, manager);
          if (await this.blocks.findByRegionAndName(regionId, input.name, manager)) {
            throw new BlockNameTakenError(input.name);
          }
          await this.spatial.assertBlockRules(geometry, { regionId }, manager);
        },
        manager,
      );

      const saved = await this.blocks.save(
        this.blocks.build({
          projectId: input.projectId,
          boundaryId: boundary.id,
          name: input.name,
          description: input.description ?? '',
          status: input.status ?? BlockStatus.active,
        }),
        manager,
      );
      // Re-read: region_id and area_m2 were filled in by the database.
      return (await this.blocks.findById(saved.id, manager)) as Block;
    });
  }
}
