import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Block } from '../entities/block.entity';
import { BlockNotFoundError } from '../errors/block-not-found.error';
import { BlockRepository } from '../repositories/block.repository';
import { GetBlockDetailQuery } from './get-block-detail.query';

@QueryHandler(GetBlockDetailQuery)
export class GetBlockDetailHandler implements IQueryHandler<GetBlockDetailQuery, Block> {
  constructor(private readonly blocks: BlockRepository) {}

  async execute({ id }: GetBlockDetailQuery): Promise<Block> {
    const block = await this.blocks.findDetailById(id);
    if (!block) throw new BlockNotFoundError(id);
    return block;
  }
}
