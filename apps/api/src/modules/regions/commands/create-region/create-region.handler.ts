import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionService } from '../../../../common/database/transaction.service';
import { RegionNotFoundError } from '../../errors/region-not-found.error';
import type { IRegionWithStats } from '../../interfaces/region-with-stats.interface';
import { RegionsRepository } from '../../repositories/regions.repository';
import { CreateRegionCommand } from './create-region.command';

@CommandHandler(CreateRegionCommand)
export class CreateRegionHandler implements ICommandHandler<CreateRegionCommand> {
  constructor(
    private readonly regions: RegionsRepository,
    private readonly transactions: TransactionService,
  ) {}

  async execute({
    name,
    description,
    territory,
  }: CreateRegionCommand): Promise<IRegionWithStats> {
    return this.transactions.run(async (manager) => {
      const region = await this.regions.create({ name, description, territory }, manager);
      const withStats = await this.regions.findByIdWithStats(
        region.id,
        manager,
      );
      if (!withStats) throw new RegionNotFoundError(region.id);
      return withStats;
    });
  }
}
