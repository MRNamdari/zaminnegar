import { Command } from '@nestjs/cqrs';
import type { IOwner } from '../../interfaces/owner.interface';

/** Partially updates an owner. Resolves with the stored owner. */
export class UpdateOwnerCommand extends Command<IOwner> {
  constructor(
    public readonly ownerId: string,
    public readonly patch: Partial<Pick<IOwner, 'name' | 'phone' | 'email' | 'notes'>>,
  ) {
    super();
  }
}
