import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { ParcelStatus } from '../../../common/enums/parcel-status.enum';
import { ProjectMismatchError } from '../../../common/errors/project-mismatch.error';
import { BlockNotFoundError } from '../../block/errors/block-not-found.error';
import { BlockRepository } from '../../block/repositories/block.repository';
import { BoundaryGeometryService } from '../../geometry/services/boundary-geometry.service';
import { SpatialRulesService } from '../../geometry/services/spatial-rules.service';
import { ProjectNotFoundError } from '../../project/errors/project-not-found.error';
import { ProjectRepository } from '../../project/repositories/project.repository';
import { RegionNotFoundError } from '../../region/errors/region-not-found.error';
import { RegionRepository } from '../../region/repositories/region.repository';
import { Parcel } from '../entities/parcel.entity';
import { BlockRegionMismatchError } from '../errors/block-region-mismatch.error';
import { ParcelNameTakenError } from '../errors/parcel-name-taken.error';
import { ParcelRepository } from '../repositories/parcel.repository';
import { CreateParcelCommand } from './create-parcel.command';

@CommandHandler(CreateParcelCommand)
export class CreateParcelHandler implements ICommandHandler<CreateParcelCommand, Parcel> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly parcels: ParcelRepository,
    private readonly blocks: BlockRepository,
    private readonly regions: RegionRepository,
    private readonly projects: ProjectRepository,
    private readonly geometry: BoundaryGeometryService,
    private readonly spatial: SpatialRulesService,
  ) {}

  execute({ input }: CreateParcelCommand): Promise<Parcel> {
    return this.dataSource.transaction(async (manager) => {
      if (!(await this.projects.findById(input.projectId, manager))) throw new ProjectNotFoundError(input.projectId);

      const region = await this.regions.findById(input.regionId, manager);
      if (!region) throw new RegionNotFoundError(input.regionId);
      if (region.projectId !== input.projectId) throw new ProjectMismatchError('region', region.id);

      const blockId = input.blockId ?? null;
      if (blockId) {
        const block = await this.blocks.findById(blockId, manager);
        if (!block) throw new BlockNotFoundError(blockId);
        if (block.regionId !== input.regionId) throw new BlockRegionMismatchError(blockId, input.regionId);
      }

      if (await this.parcels.findByProjectAndName(input.projectId, input.name, manager)) {
        throw new ParcelNameTakenError(input.name);
      }

      const boundary = await this.geometry.acquire(
        input,
        { projectId: input.projectId, name: input.name },
        (geometry) => this.spatial.assertParcelRules(geometry, { regionId: input.regionId, blockId }, manager),
        manager,
      );

      // ck_parcels__block_occupancy_pct_iff_block_id: the block occupancy must be set exactly when
      // the parcel has a block, so insert 0 and let recalculateMetrics fill in the real values.
      const parcel = await this.parcels.save(
        this.parcels.build({
          projectId: input.projectId,
          regionId: input.regionId,
          blockId,
          boundaryId: boundary.id,
          name: input.name,
          status: input.status ?? ParcelStatus.active,
          areaM2: 0,
          regionOccupancyPct: 0,
          blockOccupancyPct: blockId ? 0 : null,
        }),
        manager,
      );
      await this.parcels.recalculateMetrics({ parcelId: parcel.id }, manager);
      return (await this.parcels.findById(parcel.id, manager)) as Parcel;
    });
  }
}
