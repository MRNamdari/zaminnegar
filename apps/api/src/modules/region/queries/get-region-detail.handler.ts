import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Region } from '../entities/region.entity';
import { RegionNotFoundError } from '../errors/region-not-found.error';
import { RegionRepository } from '../repositories/region.repository';
import { GetRegionDetailQuery } from './get-region-detail.query';

@QueryHandler(GetRegionDetailQuery)
export class GetRegionDetailHandler implements IQueryHandler<GetRegionDetailQuery, Region> {
  constructor(private readonly regions: RegionRepository) {}

  async execute({ id }: GetRegionDetailQuery): Promise<Region> {
    const region = await this.regions.findDetailById(id);
    if (!region) throw new RegionNotFoundError(id);
    return region;
  }
}
