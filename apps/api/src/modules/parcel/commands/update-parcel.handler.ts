import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { BoundaryGeometryService } from '../../geometry/services/boundary-geometry.service';
import { Parcel } from '../entities/parcel.entity';
import { ParcelNameTakenError } from '../errors/parcel-name-taken.error';
import { ParcelNotFoundError } from '../errors/parcel-not-found.error';
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

      if (dto.name !== undefined && dto.name !== parcel.name) {
        const existing = await this.parcels.findByProjectAndName(parcel.projectId, dto.name, manager);
        if (existing && existing.id !== parcel.id) throw new ParcelNameTakenError(dto.name);
        parcel.name = dto.name;
      }
      if (dto.status !== undefined) parcel.status = dto.status;
      await this.parcels.save(parcel, manager);

      // The trigger re-derives region/block and the metrics from the new outline; a parcel can move
      // to another block (or none) by editing its geometry.
      if (dto.geometry) await this.geometry.replaceGeometry(parcel.boundaryId, dto.geometry, manager);
      return (await this.parcels.findById(id, manager)) as Parcel;
    });
  }
}
