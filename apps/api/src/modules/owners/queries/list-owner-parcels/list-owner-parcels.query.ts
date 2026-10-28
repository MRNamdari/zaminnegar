import { Query } from '@nestjs/cqrs';
import type { IPaginated } from '../../../../common/interfaces/paginated.interface';
import type { IParcelOwner } from '../../interfaces/owner.interface';

/** Lists all parcel-owner links for a given owner. */
export class ListOwnerParcelsQuery extends Query<IPaginated<IParcelOwner>> {
  constructor(
    public readonly ownerId: string,
    public readonly limit: number,
    public readonly offset: number,
  ) {
    super();
  }
}
