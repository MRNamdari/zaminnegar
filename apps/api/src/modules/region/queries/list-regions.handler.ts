import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedResult } from '../../../common/utils/paginate';
import { Region } from '../entities/region.entity';
import { RegionRepository } from '../repositories/region.repository';
import { ListRegionsQuery } from './list-regions.query';

@QueryHandler(ListRegionsQuery)
export class ListRegionsHandler implements IQueryHandler<ListRegionsQuery, PaginatedResult<Region>> {
  constructor(private readonly regions: RegionRepository) {}

  execute({ dto, projectScope }: ListRegionsQuery): Promise<PaginatedResult<Region>> {
    return this.regions.findPage(dto, projectScope);
  }
}
