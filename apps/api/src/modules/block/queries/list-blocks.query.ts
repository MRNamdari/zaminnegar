import { BlockQueryDto } from '../dto/block-query.dto';

export class ListBlocksQuery {
  constructor(
    public readonly dto: BlockQueryDto,
    /** Projects the caller may read; null = all. */
    public readonly projectScope: string[] | null = null,
  ) {}
}
