import { Command } from '@nestjs/cqrs';
import type { UpdateParcelDto } from '../../dto/update-parcel.dto';
import type { IParcel } from '../../interfaces/parcel.interface';

/** Partially updates a parcel. Resolves with the stored parcel. */
export class UpdateParcelCommand extends Command<IParcel> {
  constructor(
    public readonly projectId: string,
    public readonly parcelId: string,
    public readonly patch: UpdateParcelDto,
  ) {
    super();
  }
}
