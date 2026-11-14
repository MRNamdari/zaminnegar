import { BoundaryQueryDto } from '../dto/boundary-query.dto';

export class ListBoundariesQuery {
  constructor(
    public readonly dto: BoundaryQueryDto,
    /** Projects the caller may read; null = all. */
    public readonly projectScope: string[] | null = null,
  ) {}
}
