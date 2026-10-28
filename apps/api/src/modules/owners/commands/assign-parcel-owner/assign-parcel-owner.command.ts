import { Command } from '@nestjs/cqrs';
import type { IParcelOwner } from '../../interfaces/owner.interface';

/** Associates an owner with a parcel at a specific share. */
export class AssignParcelOwnerCommand extends Command<IParcelOwner> {
  constructor(
    public readonly parcelId: string,
    public readonly ownerId: string,
    public readonly share: number,
  ) {
    super();
  }
}
