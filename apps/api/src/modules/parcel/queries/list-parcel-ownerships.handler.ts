import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ParcelOwnership } from '../entities/parcel-ownership.entity';
import { ParcelNotFoundError } from '../errors/parcel-not-found.error';
import { ParcelOwnershipRepository } from '../repositories/parcel-ownership.repository';
import { ParcelRepository } from '../repositories/parcel.repository';
import { ListParcelOwnershipsQuery } from './list-parcel-ownerships.query';

/** Each returned ownership has its `owner` relation loaded. */
@QueryHandler(ListParcelOwnershipsQuery)
export class ListParcelOwnershipsHandler implements IQueryHandler<ListParcelOwnershipsQuery, ParcelOwnership[]> {
  constructor(
    private readonly parcels: ParcelRepository,
    private readonly ownerships: ParcelOwnershipRepository,
  ) {}

  async execute({ parcelId }: ListParcelOwnershipsQuery): Promise<ParcelOwnership[]> {
    if (!(await this.parcels.findById(parcelId))) throw new ParcelNotFoundError(parcelId);
    return this.ownerships.findByParcelWithOwner(parcelId);
  }
}
