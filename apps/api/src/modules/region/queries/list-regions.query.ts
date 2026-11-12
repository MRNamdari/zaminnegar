import { RegionQueryDto } from '../dto/region-query.dto';

export class ListRegionsQuery {
  constructor(
    public readonly dto: RegionQueryDto,
    /** Projects the caller may read; null = all. */
    public readonly projectScope: string[] | null = null,
  ) {}
}
