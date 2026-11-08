import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Block } from '../entities/block.entity';
import { BlockNotFoundError } from '../errors/block-not-found.error';
import { BlockRepository } from '../repositories/block.repository';
import { GetBlockQuery } from './get-block.query';

@QueryHandler(GetBlockQuery)
export class GetBlockHandler implements IQueryHandler<GetBlockQuery, Block> {
  constructor(private readonly blocks: BlockRepository) {}

  async execute({ id }: GetBlockQuery): Promise<Block> {
    const block = await this.blocks.findById(id);
    if (!block) throw new BlockNotFoundError(id);
    return block;
  }
}
