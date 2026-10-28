import { Command } from '@nestjs/cqrs';
import type { IRegionWithStats } from '../../interfaces/region-with-stats.interface';
import type { IRegion } from '../../interfaces/region.interface';

/** Partially updates a region. Resolves with the stored region. */
export class UpdateRegionCommand extends Command<IRegionWithStats> {
  constructor(
    public readonly regionId: string,
    public readonly patch: Partial<Pick<IRegion, 'name' | 'description' | 'territory'>>,
  ) {
    super();
  }
}
