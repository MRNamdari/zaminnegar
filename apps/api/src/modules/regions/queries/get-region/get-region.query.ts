import { Query } from '@nestjs/cqrs';
import type { IRegionWithStats } from '../../interfaces/region-with-stats.interface';

/** Fetches one Region. Rejects with `RegionNotFoundError` when it does not exist. */
export class GetRegionQuery extends Query<IRegionWithStats> {
  constructor(public readonly regionId: string) {
    super();
  }
}
