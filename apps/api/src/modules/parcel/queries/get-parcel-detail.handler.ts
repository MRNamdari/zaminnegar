import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Parcel } from '../entities/parcel.entity';
import { ParcelNotFoundError } from '../errors/parcel-not-found.error';
import { ParcelRepository } from '../repositories/parcel.repository';
import { GetParcelDetailQuery } from './get-parcel-detail.query';

@QueryHandler(GetParcelDetailQuery)
export class GetParcelDetailHandler implements IQueryHandler<GetParcelDetailQuery, Parcel> {
  constructor(private readonly parcels: ParcelRepository) {}

  async execute({ id }: GetParcelDetailQuery): Promise<Parcel> {
    const parcel = await this.parcels.findDetailById(id);
    if (!parcel) throw new ParcelNotFoundError(id);
    return parcel;
  }
}
