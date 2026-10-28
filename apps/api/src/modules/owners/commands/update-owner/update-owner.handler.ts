import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionService } from '../../../../common/database/transaction.service';
import { omitUndefined } from '../../../../common/utils/omit-undefined';
import { OwnerNotFoundError } from '../../errors/owner-not-found.error';
import type { IOwner } from '../../interfaces/owner.interface';
import { OwnersRepository } from '../../repositories/owners.repository';
import { UpdateOwnerCommand } from './update-owner.command';

@CommandHandler(UpdateOwnerCommand)
export class UpdateOwnerHandler implements ICommandHandler<UpdateOwnerCommand> {
  constructor(
    private readonly owners: OwnersRepository,
    private readonly transactions: TransactionService,
  ) {}

  async execute({ ownerId, patch }: UpdateOwnerCommand): Promise<IOwner> {
    const changes = omitUndefined(patch);

    return this.transactions.run(async (manager) => {
      if (Object.keys(changes).length === 0) {
        const owner = await this.owners.findById(ownerId, manager);
        if (!owner) throw new OwnerNotFoundError(ownerId);
        return owner;
      }

      const updated = await this.owners.update(ownerId, changes, manager);
      if (!updated) throw new OwnerNotFoundError(ownerId);

      const owner = await this.owners.findById(ownerId, manager);
      if (!owner) throw new OwnerNotFoundError(ownerId);
      return owner;
    });
  }
}
