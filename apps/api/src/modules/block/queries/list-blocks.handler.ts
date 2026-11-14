import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedResult } from '../../../common/utils/paginate';
import { Block } from '../entities/block.entity';
import { BlockRepository } from '../repositories/block.repository';
import { ListBlocksQuery } from './list-blocks.query';

@QueryHandler(ListBlocksQuery)
export class ListBlocksHandler implements IQueryHandler<ListBlocksQuery, PaginatedResult<Block>> {
  constructor(private readonly blocks: BlockRepository) {}

  execute({ dto, projectScope }: ListBlocksQuery): Promise<PaginatedResult<Block>> {
    return this.blocks.findPage(dto, projectScope);
  }
}
