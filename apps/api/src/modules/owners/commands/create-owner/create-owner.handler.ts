import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionService } from '../../../../common/database/transaction.service';
import { OwnerNotFoundError } from '../../errors/owner-not-found.error';
import type { IOwner } from '../../interfaces/owner.interface';
import { OwnersRepository } from '../../repositories/owners.repository';
import { CreateOwnerCommand } from './create-owner.command';

@CommandHandler(CreateOwnerCommand)
export class CreateOwnerHandler implements ICommandHandler<CreateOwnerCommand> {
  constructor(
    private readonly owners: OwnersRepository,
    private readonly transactions: TransactionService,
  ) {}

  async execute({ name, phone, email, notes }: CreateOwnerCommand): Promise<IOwner> {
    return this.transactions.run(async (manager) => {
      const owner = await this.owners.create({ name, phone, email, notes }, manager);
      const created = await this.owners.findById(owner.id, manager);
      if (!created) throw new OwnerNotFoundError(owner.id);
      return created;
    });
  }
}
