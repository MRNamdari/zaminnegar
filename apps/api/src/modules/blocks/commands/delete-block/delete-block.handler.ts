import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionService } from '../../../../common/database/transaction.service';
import { BlockNotFoundError } from '../../errors/block-not-found.error';
import { BlocksRepository } from '../../repositories/blocks.repository';
import { DeleteBlockCommand } from './delete-block.command';

@CommandHandler(DeleteBlockCommand)
export class DeleteBlockHandler implements ICommandHandler<DeleteBlockCommand> {
  constructor(
    private readonly blocks: BlocksRepository,
    private readonly transactions: TransactionService,
  ) {}

  async execute({ regionId, blockId }: DeleteBlockCommand): Promise<void> {
    return this.transactions.run(async (manager) => {
      const existing = await this.blocks.findByIdAndRegionId(blockId, regionId, manager);
      if (!existing) throw new BlockNotFoundError(blockId);
      const removed = await this.blocks.delete(regionId, blockId, manager);
      if (!removed) throw new BlockNotFoundError(blockId);
    });
  }
}
