import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { BoundaryRepository } from '../../boundary/repositories/boundary.repository';
import { BlockNotEmptyError } from '../errors/block-not-empty.error';
import { BlockNotFoundError } from '../errors/block-not-found.error';
import { BlockRepository } from '../repositories/block.repository';
import { DeleteBlockCommand } from './delete-block.command';

/** Refuses while the block still has parcels; removes the block's boundary with it. */
@CommandHandler(DeleteBlockCommand)
export class DeleteBlockHandler implements ICommandHandler<DeleteBlockCommand, void> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly blocks: BlockRepository,
    private readonly boundaries: BoundaryRepository,
  ) {}

  async execute({ id }: DeleteBlockCommand): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const block = await this.blocks.findById(id, manager);
      if (!block) throw new BlockNotFoundError(id);

      const parcels = await this.blocks.countParcels(id, manager);
      if (parcels > 0) throw new BlockNotEmptyError(parcels);

      await this.blocks.deleteById(id, manager);
      await this.boundaries.deleteById(block.boundaryId, manager);
    });
  }
}
