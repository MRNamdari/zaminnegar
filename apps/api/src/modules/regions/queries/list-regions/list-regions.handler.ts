import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { IPaginated } from '../../../../common/interfaces/paginated.interface';
import type { IRegionWithStats } from '../../interfaces/region-with-stats.interface';
import { RegionsRepository } from '../../repositories/regions.repository';
import { ListRegionsQuery } from './list-regions.query';

@QueryHandler(ListRegionsQuery)
export class ListRegionsHandler implements IQueryHandler<ListRegionsQuery> {
  constructor(private readonly regions: RegionsRepository) {}

  async execute({
    limit,
    offset,
  }: ListRegionsQuery): Promise<IPaginated<IRegionWithStats>> {
    const [items, total] = await Promise.all([
      this.regions.findAllWithStats(limit, offset),
      this.regions.count(),
    ]);
    return { items, total };
  }
}
