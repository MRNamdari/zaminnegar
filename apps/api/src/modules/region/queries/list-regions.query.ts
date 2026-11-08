import { RegionQueryDto } from '../dto/region-query.dto';

export class ListRegionsQuery {
  constructor(public readonly dto: RegionQueryDto) {}
}
