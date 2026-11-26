import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ListRegionParcelsQuery } from "./list-region-parcels.query";
import { RegionRepository } from "@/modules/region/repositories/region.repository";
import { RegionNotFoundError } from "@/modules/region/errors/region-not-found.error";
import { Region } from "@/modules/region/entities/region.entity";

@QueryHandler(ListRegionParcelsQuery)
export class ListRegionParcelsHandler implements IQueryHandler<
  ListRegionParcelsQuery,
 Region | null
> {
  constructor(
    private readonly regions: RegionRepository,
  ) {}

  async execute({
    regionId,
  }: ListRegionParcelsQuery): Promise<Region | null> {
    if (!(await this.regions.findById(regionId)))
      throw new RegionNotFoundError(regionId);
    return this.regions.findByIdWithParcels(regionId);
  }
}