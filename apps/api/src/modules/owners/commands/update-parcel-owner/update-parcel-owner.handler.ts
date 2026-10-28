import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionService } from '../../../../common/database/transaction.service';
import { omitUndefined } from '../../../../common/utils/omit-undefined';
import { ParcelOwnerNotFoundError } from '../../errors/parcel-owner-not-found.error';
import type { IParcelOwner } from '../../interfaces/owner.interface';
import { ParcelOwnersRepository } from '../../repositories/parcel-owners.repository';
import { UpdateParcelOwnerCommand } from './update-parcel-owner.command';

@CommandHandler(UpdateParcelOwnerCommand)
export class UpdateParcelOwnerHandler implements ICommandHandler<UpdateParcelOwnerCommand> {
  constructor(
    private readonly parcelOwners: ParcelOwnersRepository,
    private readonly transactions: TransactionService,
  ) {}

  async execute({ parcelId, ownerId, patch }: UpdateParcelOwnerCommand): Promise<IParcelOwner> {
    const changes = omitUndefined(patch);

    return this.transactions.run(async (manager) => {
      const existing = await this.parcelOwners.findByParcelAndOwner(parcelId, ownerId, manager);
      if (!existing) throw new ParcelOwnerNotFoundError(parcelId, ownerId);

      if (Object.keys(changes).length === 0) {
        return existing;
      }

      const updated = await this.parcelOwners.update(parcelId, ownerId, changes, manager);
      if (!updated) throw new ParcelOwnerNotFoundError(parcelId, ownerId);

      const parcelOwner = await this.parcelOwners.findByParcelAndOwner(parcelId, ownerId, manager);
      if (!parcelOwner) throw new ParcelOwnerNotFoundError(parcelId, ownerId);
      return parcelOwner;
    });
  }
}
