import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { OwnershipNotFoundError } from '../errors/ownership-not-found.error';
import { ParcelNotFoundError } from '../errors/parcel-not-found.error';
import { ParcelOwnershipRepository } from '../repositories/parcel-ownership.repository';
import { ParcelRepository } from '../repositories/parcel.repository';
import { RemoveOwnerCommand } from './remove-owner.command';

@CommandHandler(RemoveOwnerCommand)
export class RemoveOwnerHandler implements ICommandHandler<RemoveOwnerCommand, void> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly parcels: ParcelRepository,
    private readonly ownerships: ParcelOwnershipRepository,
  ) {}

  async execute({ parcelId, ownerId }: RemoveOwnerCommand): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      if (!(await this.parcels.findByIdForUpdate(parcelId, manager))) throw new ParcelNotFoundError(parcelId);
      if (!(await this.ownerships.remove(parcelId, ownerId, manager))) {
        throw new OwnershipNotFoundError(parcelId, ownerId);
      }
    });
  }
}
