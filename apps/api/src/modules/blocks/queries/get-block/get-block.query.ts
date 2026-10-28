import { Query } from '@nestjs/cqrs';
import type { IBlock } from '../../interfaces/block.interface';

/** Fetches a block by id inside a region. */
export class GetBlockQuery extends Query<IBlock> {
  constructor(
    public readonly regionId: string,
    public readonly blockId: string,
  ) {
    super();
  }
}
