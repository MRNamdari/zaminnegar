import { Command } from '@nestjs/cqrs';

/** Deletes one parcel. Rejects with `ParcelNotFoundError` when it does not exist. */
export class DeleteParcelCommand extends Command<void> {
  constructor(
    public readonly projectId: string,
    public readonly parcelId: string,
  ) {
    super();
  }
}
