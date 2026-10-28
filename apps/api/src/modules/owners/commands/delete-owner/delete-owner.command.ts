import { Command } from '@nestjs/cqrs';

/** Deletes one owner. Rejects with `OwnerNotFoundError` when it does not exist. */
export class DeleteOwnerCommand extends Command<void> {
  constructor(public readonly ownerId: string) {
    super();
  }
}
