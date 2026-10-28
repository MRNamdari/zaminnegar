import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionService } from '../../../../common/database/transaction.service';
import { omitUndefined } from '../../../../common/utils/omit-undefined';
import { BlockNotFoundError } from '../../errors/block-not-found.error';
import type { IBlock } from '../../interfaces/block.interface';
import { BlocksRepository } from '../../repositories/blocks.repository';
import { UpdateBlockCommand } from './update-block.command';

@CommandHandler(UpdateBlockCommand)
export class UpdateBlockHandler implements ICommandHandler<UpdateBlockCommand> {
  constructor(
    private readonly blocks: BlocksRepository,
    private readonly transactions: TransactionService,
  ) {}

  async execute({ regionId, blockId, patch }: UpdateBlockCommand): Promise<IBlock> {
    const changes = omitUndefined(patch);

    return this.transactions.run(async (manager) => {
      if (Object.keys(changes).length === 0) {
        const block = await this.blocks.findByIdAndRegionId(blockId, regionId, manager);
        if (!block) throw new BlockNotFoundError(blockId);
        return block;
      }

      const updated = await this.blocks.update(regionId, blockId, changes, manager);
      if (!updated) throw new BlockNotFoundError(blockId);

      const block = await this.blocks.findByIdAndRegionId(blockId, regionId, manager);
      if (!block) throw new BlockNotFoundError(blockId);
      return block;
    });
  }
}
