import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { IPaginated } from '../../../../common/interfaces/paginated.interface';
import type { IParcelOwner } from '../../interfaces/owner.interface';
import { ParcelOwnersRepository } from '../../repositories/parcel-owners.repository';
import { ListParcelOwnersQuery } from './list-parcel-owners.query';

@QueryHandler(ListParcelOwnersQuery)
export class ListParcelOwnersHandler implements IQueryHandler<ListParcelOwnersQuery> {
  constructor(private readonly parcelOwners: ParcelOwnersRepository) {}

  async execute({ parcelId, limit, offset }: ListParcelOwnersQuery): Promise<IPaginated<IParcelOwner>> {
    const [items, total] = await Promise.all([
      this.parcelOwners.findAllByParcelId(parcelId, limit, offset),
      this.parcelOwners.countByParcelId(parcelId),
    ]);
    return { items, total };
  }
}
