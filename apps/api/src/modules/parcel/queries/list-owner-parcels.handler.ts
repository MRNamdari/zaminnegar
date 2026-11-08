import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { OwnerNotFoundError } from '../../owner/errors/owner-not-found.error';
import { OwnerRepository } from '../../owner/repositories/owner.repository';
import { ParcelOwnership } from '../entities/parcel-ownership.entity';
import { ParcelOwnershipRepository } from '../repositories/parcel-ownership.repository';
import { ListOwnerParcelsQuery } from './list-owner-parcels.query';

/** Each returned ownership has its `parcel` relation loaded. */
@QueryHandler(ListOwnerParcelsQuery)
export class ListOwnerParcelsHandler implements IQueryHandler<ListOwnerParcelsQuery, ParcelOwnership[]> {
  constructor(
    private readonly owners: OwnerRepository,
    private readonly ownerships: ParcelOwnershipRepository,
  ) {}

  async execute({ ownerId }: ListOwnerParcelsQuery): Promise<ParcelOwnership[]> {
    if (!(await this.owners.findById(ownerId))) throw new OwnerNotFoundError(ownerId);
    return this.ownerships.findByOwnerWithParcel(ownerId);
  }
}
