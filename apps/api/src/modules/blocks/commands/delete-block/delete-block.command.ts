import { Command } from '@nestjs/cqrs';

/** Deletes one block from a region. Rejects with `BlockNotFoundError` when it does not exist. */
export class DeleteBlockCommand extends Command<void> {
  constructor(
    public readonly regionId: string,
    public readonly blockId: string,
  ) {
    super();
  }
}
