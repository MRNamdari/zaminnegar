import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ParcelNotFoundError } from '../../errors/parcel-not-found.error';
import type { IParcel } from '../../interfaces/parcel.interface';
import { ParcelsRepository } from '../../repositories/parcels.repository';
import { GetParcelQuery } from './get-parcel.query';

@QueryHandler(GetParcelQuery)
export class GetParcelHandler implements IQueryHandler<GetParcelQuery> {
  constructor(private readonly parcels: ParcelsRepository) {}

  async execute({ projectId, parcelId }: GetParcelQuery): Promise<IParcel> {
    const parcel = await this.parcels.findOne(projectId, parcelId);
    if (!parcel) throw new ParcelNotFoundError(parcelId);
    return parcel;
  }
}
