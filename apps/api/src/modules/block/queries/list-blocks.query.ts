import { BlockQueryDto } from '../dto/block-query.dto';

export class ListBlocksQuery {
  constructor(public readonly dto: BlockQueryDto) {}
}
