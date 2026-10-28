import { Query } from '@nestjs/cqrs';
import type { IPaginated } from '../../../../common/interfaces/paginated.interface';
import type { IRegionWithStats } from '../../interfaces/region-with-stats.interface';

/** Lists regions, most recently changed first. */
export class ListRegionsQuery extends Query<IPaginated<IRegionWithStats>> {
  constructor(
    public readonly limit: number,
    public readonly offset: number,
  ) {
    super();
  }
}
