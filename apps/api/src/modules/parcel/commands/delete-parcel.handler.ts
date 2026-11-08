import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { BoundaryRepository } from '../../boundary/repositories/boundary.repository';
import { ParcelNotFoundError } from '../errors/parcel-not-found.error';
import { ParcelRepository } from '../repositories/parcel.repository';
import { DeleteParcelCommand } from './delete-parcel.command';

/** Removes the parcel, its ownerships (FK cascade) and its boundary. */
@CommandHandler(DeleteParcelCommand)
export class DeleteParcelHandler implements ICommandHandler<DeleteParcelCommand, void> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly parcels: ParcelRepository,
    private readonly boundaries: BoundaryRepository,
  ) {}

  async execute({ id }: DeleteParcelCommand): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const parcel = await this.parcels.findById(id, manager);
      if (!parcel) throw new ParcelNotFoundError(id);

      await this.parcels.deleteById(id, manager);
      await this.boundaries.deleteById(parcel.boundaryId, manager);
    });
  }
}
