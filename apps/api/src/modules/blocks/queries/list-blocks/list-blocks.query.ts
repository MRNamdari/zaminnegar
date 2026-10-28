import { Query } from '@nestjs/cqrs';
import type { IPaginated } from '../../../../common/interfaces/paginated.interface';
import type { IBlock } from '../../interfaces/block.interface';

/** Lists blocks in a region. */
export class ListBlocksQuery extends Query<IPaginated<IBlock>> {
  constructor(
    public readonly regionId: string,
    public readonly limit: number,
    public readonly offset: number,
  ) {
    super();
  }
}
