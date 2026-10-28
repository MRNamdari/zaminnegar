import { Command } from '@nestjs/cqrs';
import type { IBlock } from '../../interfaces/block.interface';

/** Partially updates a block. Resolves with the stored block. */
export class UpdateBlockCommand extends Command<IBlock> {
  constructor(
    public readonly regionId: string,
    public readonly blockId: string,
    public readonly patch: Partial<Pick<IBlock, 'name' | 'description'>>,
  ) {
    super();
  }
}
