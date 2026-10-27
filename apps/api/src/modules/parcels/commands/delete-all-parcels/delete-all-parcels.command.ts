import { Command } from '@nestjs/cqrs';

/** Deletes every parcel of a project. Resolves with the number of deleted parcels. */
export class DeleteAllParcelsCommand extends Command<number> {
  constructor(public readonly projectId: string) {
    super();
  }
}
