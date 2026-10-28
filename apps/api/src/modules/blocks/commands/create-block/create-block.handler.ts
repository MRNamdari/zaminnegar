import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionService } from '../../../../common/database/transaction.service';
import { BlockNotFoundError } from '../../errors/block-not-found.error';
import type { IBlock } from '../../interfaces/block.interface';
import { BlocksRepository } from '../../repositories/blocks.repository';
import { CreateBlockCommand } from './create-block.command';

@CommandHandler(CreateBlockCommand)
export class CreateBlockHandler implements ICommandHandler<CreateBlockCommand> {
  constructor(
    private readonly blocks: BlocksRepository,
    private readonly transactions: TransactionService,
  ) {}

  async execute({ regionId, name, description }: CreateBlockCommand): Promise<IBlock> {
    return this.transactions.run(async (manager) => {
      const block = await this.blocks.create({ regionId, name, description }, manager);
      const created = await this.blocks.findByIdAndRegionId(block.id, regionId, manager);
      if (!created) throw new BlockNotFoundError(block.id);
      return created;
    });
  }
}
