import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { ParcelOwnershipRepository } from '../../parcel/repositories/parcel-ownership.repository';
import { OwnerHasOwnershipsError } from '../errors/owner-has-ownerships.error';
import { OwnerNotFoundError } from '../errors/owner-not-found.error';
import { OwnerRepository } from '../repositories/owner.repository';
import { DeleteOwnerCommand } from './delete-owner.command';

@CommandHandler(DeleteOwnerCommand)
export class DeleteOwnerHandler implements ICommandHandler<DeleteOwnerCommand, void> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly owners: OwnerRepository,
    private readonly ownerships: ParcelOwnershipRepository,
  ) {}

  async execute({ id }: DeleteOwnerCommand): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      if (!(await this.owners.findById(id, manager))) throw new OwnerNotFoundError(id);
      const parcels = await this.ownerships.countByOwner(id, manager);
      if (parcels > 0) throw new OwnerHasOwnershipsError(id, parcels);
      await this.owners.deleteById(id, manager);
    });
  }
}
