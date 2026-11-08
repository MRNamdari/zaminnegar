import { ParcelQueryDto } from '../dto/parcel-query.dto';

export class ListParcelsQuery {
  constructor(public readonly dto: ParcelQueryDto) {}
}
