import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedResult } from '../../../common/utils/paginate';
import { Parcel } from '../entities/parcel.entity';
import { ParcelRepository } from '../repositories/parcel.repository';
import { ListParcelsQuery } from './list-parcels.query';

@QueryHandler(ListParcelsQuery)
export class ListParcelsHandler implements IQueryHandler<ListParcelsQuery, PaginatedResult<Parcel>> {
  constructor(private readonly parcels: ParcelRepository) {}

  execute({ dto, projectScope }: ListParcelsQuery): Promise<PaginatedResult<Parcel>> {
    return this.parcels.findPage(dto, projectScope);
  }
}
