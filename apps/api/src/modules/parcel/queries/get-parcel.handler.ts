import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Parcel } from '../entities/parcel.entity';
import { ParcelNotFoundError } from '../errors/parcel-not-found.error';
import { ParcelRepository } from '../repositories/parcel.repository';
import { GetParcelQuery } from './get-parcel.query';

@QueryHandler(GetParcelQuery)
export class GetParcelHandler implements IQueryHandler<GetParcelQuery, Parcel> {
  constructor(private readonly parcels: ParcelRepository) {}

  async execute({ id }: GetParcelQuery): Promise<Parcel> {
    const parcel = await this.parcels.findById(id);
    if (!parcel) throw new ParcelNotFoundError(id);
    return parcel;
  }
}
