import { Command } from '@nestjs/cqrs';
import type { IOwner } from '../../interfaces/owner.interface';

/** Creates a property owner. */
export class CreateOwnerCommand extends Command<IOwner> {
  constructor(
    public readonly name: string,
    public readonly phone: string | null,
    public readonly email: string | null,
    public readonly notes: string | null,
  ) {
    super();
  }
}
