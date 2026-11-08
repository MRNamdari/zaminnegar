import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { BoundaryGeometryService } from '../../geometry/services/boundary-geometry.service';
import { Parcel } from '../entities/parcel.entity';
import { ParcelNameTakenError } from '../errors/parcel-name-taken.error';
import { ParcelNotFoundError } from '../errors/parcel-not-found.error';
import { ParcelReparentNotAllowedError } from '../errors/parcel-reparent-not-allowed.error';
import { ParcelRepository } from '../repositories/parcel.repository';
import { UpdateParcelCommand } from './update-parcel.command';

@CommandHandler(UpdateParcelCommand)
export class UpdateParcelHandler implements ICommandHandler<UpdateParcelCommand, Parcel> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly parcels: ParcelRepository,
    private readonly geometry: BoundaryGeometryService,
  ) {}

  execute({ id, dto }: UpdateParcelCommand): Promise<Parcel> {
    return this.dataSource.transaction(async (manager) => {
      const parcel = await this.parcels.findById(id, manager);
      if (!parcel) throw new ParcelNotFoundError(id);

      const regionChanged = dto.regionId !== undefined && dto.regionId !== parcel.regionId;
      const blockChanged = dto.blockId !== undefined && (dto.blockId ?? null) !== (parcel.blockId ?? null);
      if (regionChanged || blockChanged) throw new ParcelReparentNotAllowedError();

      if (dto.name !== undefined && dto.name !== parcel.name) {
        const existing = await this.parcels.findByProjectAndName(parcel.projectId, dto.name, manager);
        if (existing && existing.id !== parcel.id) throw new ParcelNameTakenError(dto.name);
        parcel.name = dto.name;
      }
      if (dto.status !== undefined) parcel.status = dto.status;

      // Save before touching the geometry: the geometry step rewrites area/occupancy columns in SQL,
      // and saving the stale entity afterwards would overwrite them.
      const saved = await this.parcels.save(parcel, manager);
      if (!dto.geometry) return saved;

      await this.geometry.replaceGeometry(parcel.boundaryId, dto.geometry, manager);
      return (await this.parcels.findById(id, manager)) as Parcel;
    });
  }
}
