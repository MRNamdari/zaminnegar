import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionService } from '../../../../common/database/transaction.service';
import { RegionNotFoundError } from '../../errors/region-not-found.error';
import { RegionsRepository } from '../../repositories/regions.repository';
import { DeleteRegionCommand } from './delete-region.command';

@CommandHandler(DeleteRegionCommand)
export class DeleteRegionHandler implements ICommandHandler<DeleteRegionCommand> {
  constructor(
    private readonly regions: RegionsRepository,
    private readonly transactions: TransactionService,
  ) {}

  async execute({ regionId }: DeleteRegionCommand): Promise<void> {
    return this.transactions.run(async (manager) => {
      const existing = await this.regions.findByIdWithStats(regionId, manager);
      if (!existing) throw new RegionNotFoundError(regionId);
      const removed = await this.regions.delete(regionId, manager);
      if (!removed) throw new RegionNotFoundError(regionId);
    });
  }
}
