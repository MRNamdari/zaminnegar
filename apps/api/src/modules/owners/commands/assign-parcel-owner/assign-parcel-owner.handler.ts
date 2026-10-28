import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionService } from '../../../../common/database/transaction.service';
import { OwnerNotFoundError } from '../../errors/owner-not-found.error';
import { ParcelOwnerAlreadyExistsError } from '../../errors/parcel-owner-already-exists.error';
import type { IParcelOwner } from '../../interfaces/owner.interface';
import { ParcelOwnersRepository } from '../../repositories/parcel-owners.repository';
import { OwnersRepository } from '../../repositories/owners.repository';
import { AssignParcelOwnerCommand } from './assign-parcel-owner.command';

@CommandHandler(AssignParcelOwnerCommand)
export class AssignParcelOwnerHandler implements ICommandHandler<AssignParcelOwnerCommand> {
  constructor(
    private readonly owners: OwnersRepository,
    private readonly parcelOwners: ParcelOwnersRepository,
    private readonly transactions: TransactionService,
  ) {}

  async execute({ parcelId, ownerId, share }: AssignParcelOwnerCommand): Promise<IParcelOwner> {
    return this.transactions.run(async (manager) => {
      const owner = await this.owners.findById(ownerId, manager);
      if (!owner) throw new OwnerNotFoundError(ownerId);

      try {
        const parcelOwner = await this.parcelOwners.create({ parcelId, ownerId, share }, manager);
        const created = await this.parcelOwners.findByParcelAndOwner(parcelId, ownerId, manager);
        if (!created) throw new ParcelOwnerAlreadyExistsError(parcelId, ownerId);
        return created;
      } catch (error) {
        if (error instanceof ParcelOwnerAlreadyExistsError) throw error;
        throw error;
      }
    });
  }
}
