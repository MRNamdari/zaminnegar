import { Command } from '@nestjs/cqrs';
import type { IParcelOwner } from '../../interfaces/owner.interface';

/** Updates the share of an owner on a parcel. */
export class UpdateParcelOwnerCommand extends Command<IParcelOwner> {
  constructor(
    public readonly parcelId: string,
    public readonly ownerId: string,
    public readonly patch: Partial<Pick<IParcelOwner, 'share'>>,
  ) {
    super();
  }
}
