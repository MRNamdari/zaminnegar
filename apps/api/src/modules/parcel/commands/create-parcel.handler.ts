import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { ParcelStatus } from '../../../common/enums/parcel-status.enum';
import { BoundaryGeometryService } from '../../geometry/services/boundary-geometry.service';
import { SpatialRulesService } from '../../geometry/services/spatial-rules.service';
import { ProjectNotFoundError } from '../../project/errors/project-not-found.error';
import { ProjectRepository } from '../../project/repositories/project.repository';
import { Parcel } from '../entities/parcel.entity';
import { ParcelNameTakenError } from '../errors/parcel-name-taken.error';
import { ParcelRepository } from '../repositories/parcel.repository';
import { CreateParcelCommand } from './create-parcel.command';

/**
 * Neither the region nor the block is an input: trigger `trg_parcels_assign_references` assigns `region_id`
 * (the region containing the outline), `block_id` (the block containing it, or null) and all metrics. The handler
 * resolves the same references up front only to apply the sibling rules before anything is written.
 */
@CommandHandler(CreateParcelCommand)
export class CreateParcelHandler implements ICommandHandler<CreateParcelCommand, Parcel> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly parcels: ParcelRepository,
    private readonly projects: ProjectRepository,
    private readonly geometry: BoundaryGeometryService,
    private readonly spatial: SpatialRulesService,
  ) {}

  execute({ input }: CreateParcelCommand): Promise<Parcel> {
    return this.dataSource.transaction(async (manager) => {
      if (!(await this.projects.findById(input.projectId, manager))) throw new ProjectNotFoundError(input.projectId);

      if (await this.parcels.findByProjectAndName(input.projectId, input.name, manager)) {
        throw new ParcelNameTakenError(input.name);
      }

      const boundary = await this.geometry.acquire(
        input,
        { projectId: input.projectId, name: input.name },
        async (geometry) => {
          const regionId = await this.spatial.resolveRegionId('parcel', geometry, input.projectId, manager);
          const blockId = await this.spatial.resolveBlockId(geometry, regionId, manager);
          await this.spatial.assertParcelRules(geometry, { regionId, blockId }, manager);
        },
        manager,
      );

      const saved = await this.parcels.save(
        this.parcels.build({
          projectId: input.projectId,
          boundaryId: boundary.id,
          name: input.name,
          status: input.status ?? ParcelStatus.active,
        }),
        manager,
      );
      // Re-read: region_id, block_id, area and occupancy were filled in by the database.
      return (await this.parcels.findById(saved.id, manager)) as Parcel;
    });
  }
}
