import { Query } from '@nestjs/cqrs';
import type { IPaginated } from '../../../../common/interfaces/paginated.interface';
import type { IParcelOwner } from '../../interfaces/owner.interface';

/** Lists ownership links for one parcel. */
export class ListParcelOwnersQuery extends Query<IPaginated<IParcelOwner>> {
  constructor(
    public readonly parcelId: string,
    public readonly limit: number,
    public readonly offset: number,
  ) {
    super();
  }
}
