import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionService } from '../../../../common/database/transaction.service';
import { OwnerNotFoundError } from '../../errors/owner-not-found.error';
import { OwnersRepository } from '../../repositories/owners.repository';
import { DeleteOwnerCommand } from './delete-owner.command';

@CommandHandler(DeleteOwnerCommand)
export class DeleteOwnerHandler implements ICommandHandler<DeleteOwnerCommand> {
  constructor(
    private readonly owners: OwnersRepository,
    private readonly transactions: TransactionService,
  ) {}

  async execute({ ownerId }: DeleteOwnerCommand): Promise<void> {
    return this.transactions.run(async (manager) => {
      const existing = await this.owners.findById(ownerId, manager);
      if (!existing) throw new OwnerNotFoundError(ownerId);
      const removed = await this.owners.delete(ownerId, manager);
      if (!removed) throw new OwnerNotFoundError(ownerId);
    });
  }
}
