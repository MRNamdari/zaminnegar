import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ListRegionParcelsQuery } from "./list-region-parcels.query";
import { RegionRepository } from "../../region/repositories/region.repository";
import { RegionNotFoundError } from "../../region/errors/region-not-found.error";
import { Region } from "../../region/entities/region.entity";

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