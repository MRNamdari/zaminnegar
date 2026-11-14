import { ParcelQueryDto } from '../dto/parcel-query.dto';

export class ListParcelsQuery {
  constructor(
    public readonly dto: ParcelQueryDto,
    /** Projects the caller may read; null = all. */
    public readonly projectScope: string[] | null = null,
  ) {}
}
