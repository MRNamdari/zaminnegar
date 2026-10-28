import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlockNotFoundError } from '../../errors/block-not-found.error';
import type { IBlock } from '../../interfaces/block.interface';
import { BlocksRepository } from '../../repositories/blocks.repository';
import { GetBlockQuery } from './get-block.query';

@QueryHandler(GetBlockQuery)
export class GetBlockHandler implements IQueryHandler<GetBlockQuery> {
  constructor(private readonly blocks: BlocksRepository) {}

  async execute({ regionId, blockId }: GetBlockQuery): Promise<IBlock> {
    const block = await this.blocks.findByIdAndRegionId(blockId, regionId);
    if (!block) throw new BlockNotFoundError(blockId);
    return block;
  }
}
