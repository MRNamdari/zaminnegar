import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Region } from '../entities/region.entity';
import { RegionNotFoundError } from '../errors/region-not-found.error';
import { RegionRepository } from '../repositories/region.repository';
import { GetRegionQuery } from './get-region.query';

@QueryHandler(GetRegionQuery)
export class GetRegionHandler implements IQueryHandler<GetRegionQuery, Region> {
  constructor(private readonly regions: RegionRepository) {}

  async execute({ id }: GetRegionQuery): Promise<Region> {
    const region = await this.regions.findById(id);
    if (!region) throw new RegionNotFoundError(id);
    return region;
  }
}
