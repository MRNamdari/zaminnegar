import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { BoundaryRepository } from '../../boundary/repositories/boundary.repository';
import { RegionNotEmptyError } from '../errors/region-not-empty.error';
import { RegionNotFoundError } from '../errors/region-not-found.error';
import { RegionRepository } from '../repositories/region.repository';
import { DeleteRegionCommand } from './delete-region.command';

/** Refuses while the region still has blocks or parcels; removes the region's boundary with it. */
@CommandHandler(DeleteRegionCommand)
export class DeleteRegionHandler implements ICommandHandler<DeleteRegionCommand, void> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly regions: RegionRepository,
    private readonly boundaries: BoundaryRepository,
  ) {}

  async execute({ id }: DeleteRegionCommand): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const region = await this.regions.findById(id, manager);
      if (!region) throw new RegionNotFoundError(id);

      const { blocks, parcels } = await this.regions.countChildren(id, manager);
      if (blocks > 0 || parcels > 0) throw new RegionNotEmptyError(blocks, parcels);

      await this.regions.deleteById(id, manager);
      await this.boundaries.deleteById(region.boundaryId, manager);
    });
  }
}
