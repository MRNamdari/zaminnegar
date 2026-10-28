import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { IPaginated } from '../../../../common/interfaces/paginated.interface';
import type { IBlock } from '../../interfaces/block.interface';
import { BlocksRepository } from '../../repositories/blocks.repository';
import { ListBlocksQuery } from './list-blocks.query';

@QueryHandler(ListBlocksQuery)
export class ListBlocksHandler implements IQueryHandler<ListBlocksQuery> {
  constructor(private readonly blocks: BlocksRepository) {}

  async execute({ regionId, limit, offset }: ListBlocksQuery): Promise<IPaginated<IBlock>> {
    const [items, total] = await Promise.all([
      this.blocks.findAllByRegionId(regionId, limit, offset),
      this.blocks.countByRegionId(regionId),
    ]);
    return { items, total };
  }
}
