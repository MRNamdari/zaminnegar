import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionService } from '../../../../common/database/transaction.service';
import { omitUndefined } from '../../../../common/utils/omit-undefined';
import { RegionNotFoundError } from '../../errors/region-not-found.error';
import type { IRegionWithStats } from '../../interfaces/region-with-stats.interface';
import { RegionsRepository } from '../../repositories/regions.repository';
import { UpdateRegionCommand } from './update-region.command';

@CommandHandler(UpdateRegionCommand)
export class UpdateRegionHandler implements ICommandHandler<UpdateRegionCommand> {
  constructor(
    private readonly regions: RegionsRepository,
    private readonly transactions: TransactionService,
  ) {}

  async execute({ regionId, patch }: UpdateRegionCommand): Promise<IRegionWithStats> {
    const changes = omitUndefined(patch);

    return this.transactions.run(async (manager) => {
      if (Object.keys(changes).length === 0) {
        const region = await this.regions.findByIdWithStats(regionId, manager);
        if (!region) throw new RegionNotFoundError(regionId);
        return region;
      }

      const updated = await this.regions.update(regionId, changes, manager);
      if (!updated) throw new RegionNotFoundError(regionId);

      const region = await this.regions.findByIdWithStats(regionId, manager);
      if (!region) throw new RegionNotFoundError(regionId);
      return region;
    });
  }
}
