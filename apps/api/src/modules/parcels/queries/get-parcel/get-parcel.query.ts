import { Query } from '@nestjs/cqrs';
import type { IParcel } from '../../interfaces/parcel.interface';

/** Fetches one parcel. Rejects with `ParcelNotFoundError` when it does not exist in the project. */
export class GetParcelQuery extends Query<IParcel> {
  constructor(
    public readonly projectId: string,
    public readonly parcelId: string,
  ) {
    super();
  }
}
