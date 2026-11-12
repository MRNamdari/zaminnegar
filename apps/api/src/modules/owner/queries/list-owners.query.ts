import { OwnerQueryDto } from '../dto/owner-query.dto';

export class ListOwnersQuery {
  constructor(
    public readonly dto: OwnerQueryDto,
    /** Projects the caller may read; null = all. */
    public readonly projectScope: string[] | null = null,
  ) {}
}
