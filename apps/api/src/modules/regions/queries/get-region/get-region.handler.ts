import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { RegionNotFoundError } from '../../errors/region-not-found.error';
import type { IRegionWithStats } from '../../interfaces/region-with-stats.interface';
import { RegionsRepository } from '../../repositories/regions.repository';
import { GetRegionQuery } from './get-region.query';

@QueryHandler(GetRegionQuery)
export class GetRegionHandler implements IQueryHandler<GetRegionQuery> {
  constructor(private readonly projects: RegionsRepository) {}

  async execute({ regionId }: GetRegionQuery): Promise<IRegionWithStats> {
    const project = await this.projects.findByIdWithStats(regionId);
    if (!project) throw new RegionNotFoundError(regionId);
    return project;
  }
}
