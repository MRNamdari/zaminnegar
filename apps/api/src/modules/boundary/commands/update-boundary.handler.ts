import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { BoundaryGeometryService } from '../../geometry/services/boundary-geometry.service';
import { Boundary } from '../entities/boundary.entity';
import { BoundaryNotFoundError } from '../errors/boundary-not-found.error';
import { BoundaryRepository } from '../repositories/boundary.repository';
import { UpdateBoundaryCommand } from './update-boundary.command';

/**
 * Changing the outline of a boundary that already belongs to a region/block/parcel re-applies that
 * feature's PostGIS rules and recalculates the affected parcel metrics.
 */
@CommandHandler(UpdateBoundaryCommand)
export class UpdateBoundaryHandler implements ICommandHandler<UpdateBoundaryCommand, Boundary> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly boundaries: BoundaryRepository,
    private readonly geometry: BoundaryGeometryService,
  ) {}

  execute({ id, dto }: UpdateBoundaryCommand): Promise<Boundary> {
    return this.dataSource.transaction(async (manager) => {
      const boundary = await this.boundaries.findByIdForUpdate(id, manager);
      if (!boundary) throw new BoundaryNotFoundError(id);

      if (dto.name !== undefined) boundary.name = dto.name;
      if (dto.geometry) return this.geometry.applyGeometry(boundary, dto.geometry, manager);
      return this.boundaries.saveAndReload(boundary, manager);
    });
  }
}
