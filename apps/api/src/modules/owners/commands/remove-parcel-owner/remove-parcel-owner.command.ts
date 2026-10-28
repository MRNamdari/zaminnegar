import { Command } from '@nestjs/cqrs';

/** Removes an owner from a parcel. */
export class RemoveParcelOwnerCommand extends Command<void> {
  constructor(
    public readonly parcelId: string,
    public readonly ownerId: string,
  ) {
    super();
  }
}
