import { Command } from '@nestjs/cqrs';

/** Deletes one region. Rejects with `RegionNotFoundError` when it does not exist. */
export class DeleteRegionCommand extends Command<void> {
  constructor(public readonly regionId: string) {
    super();
  }
}
