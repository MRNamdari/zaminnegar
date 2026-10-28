import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { IPaginated } from '../../../../common/interfaces/paginated.interface';
import type { IParcelOwner } from '../../interfaces/owner.interface';
import { ParcelOwnersRepository } from '../../repositories/parcel-owners.repository';
import { ListOwnerParcelsQuery } from './list-owner-parcels.query';

@QueryHandler(ListOwnerParcelsQuery)
export class ListOwnerParcelsHandler implements IQueryHandler<ListOwnerParcelsQuery> {
  constructor(private readonly parcelOwners: ParcelOwnersRepository) {}

  async execute({ ownerId, limit, offset }: ListOwnerParcelsQuery): Promise<IPaginated<IParcelOwner>> {
    const [items, total] = await Promise.all([
      this.parcelOwners.findAllByOwnerId(ownerId, limit, offset),
      this.parcelOwners.countByOwnerId(ownerId),
    ]);
    return { items, total };
  }
}
