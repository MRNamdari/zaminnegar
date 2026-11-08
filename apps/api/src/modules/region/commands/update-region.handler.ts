import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { BoundaryGeometryService } from '../../geometry/services/boundary-geometry.service';
import { Region } from '../entities/region.entity';
import { RegionNameTakenError } from '../errors/region-name-taken.error';
import { RegionNotFoundError } from '../errors/region-not-found.error';
import { RegionRepository } from '../repositories/region.repository';
import { UpdateRegionCommand } from './update-region.command';

@CommandHandler(UpdateRegionCommand)
export class UpdateRegionHandler implements ICommandHandler<UpdateRegionCommand, Region> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly regions: RegionRepository,
    private readonly geometry: BoundaryGeometryService,
  ) {}

  execute({ id, dto }: UpdateRegionCommand): Promise<Region> {
    return this.dataSource.transaction(async (manager) => {
      const region = await this.regions.findById(id, manager);
      if (!region) throw new RegionNotFoundError(id);

      if (dto.name !== undefined && dto.name !== region.name) {
        const existing = await this.regions.findByProjectAndName(region.projectId, dto.name, manager);
        if (existing && existing.id !== region.id) throw new RegionNameTakenError(dto.name);
        region.name = dto.name;
      }
      if (dto.description !== undefined) region.description = dto.description;
      if (dto.status !== undefined) region.status = dto.status;
      const saved = await this.regions.save(region, manager);

      // Re-checks overlap with other regions and that all blocks/parcels still fit, then
      // recalculates the occupancy of every parcel in the region.
      if (dto.geometry) await this.geometry.replaceGeometry(region.boundaryId, dto.geometry, manager);
      return saved;
    });
  }
}
