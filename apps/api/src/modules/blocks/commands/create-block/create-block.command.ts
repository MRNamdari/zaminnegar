import { Command } from '@nestjs/cqrs';
import type { IBlock } from '../../interfaces/block.interface';

/** Creates a block within a region. */
export class CreateBlockCommand extends Command<IBlock> {
  constructor(
    public readonly regionId: string,
    public readonly name: string,
    public readonly description: string,
  ) {
    super();
  }
}
