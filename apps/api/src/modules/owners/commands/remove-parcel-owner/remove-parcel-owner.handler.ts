import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionService } from '../../../../common/database/transaction.service';
import { ParcelOwnerNotFoundError } from '../../errors/parcel-owner-not-found.error';
import { ParcelOwnersRepository } from '../../repositories/parcel-owners.repository';
import { RemoveParcelOwnerCommand } from './remove-parcel-owner.command';

@CommandHandler(RemoveParcelOwnerCommand)
export class RemoveParcelOwnerHandler implements ICommandHandler<RemoveParcelOwnerCommand> {
  constructor(
    private readonly parcelOwners: ParcelOwnersRepository,
    private readonly transactions: TransactionService,
  ) {}

  async execute({ parcelId, ownerId }: RemoveParcelOwnerCommand): Promise<void> {
    return this.transactions.run(async (manager) => {
      const existing = await this.parcelOwners.findByParcelAndOwner(parcelId, ownerId, manager);
      if (!existing) throw new ParcelOwnerNotFoundError(parcelId, ownerId);
      await this.parcelOwners.delete(parcelId, ownerId, manager);
    });
  }
}
