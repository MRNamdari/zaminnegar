import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { BoundaryInUseError } from '../errors/boundary-in-use.error';
import { BoundaryNotFoundError } from '../errors/boundary-not-found.error';
import { BoundaryRepository } from '../repositories/boundary.repository';
import { DeleteBoundaryCommand } from './delete-boundary.command';

/** Only draft boundaries can be deleted; delete the region, block or parcel to remove an owned one. */
@CommandHandler(DeleteBoundaryCommand)
export class DeleteBoundaryHandler implements ICommandHandler<DeleteBoundaryCommand, void> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly boundaries: BoundaryRepository,
  ) {}

  async execute({ id }: DeleteBoundaryCommand): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      if (!(await this.boundaries.findByIdForUpdate(id, manager))) throw new BoundaryNotFoundError(id);
      if (await this.boundaries.findUsage(id, manager)) throw new BoundaryInUseError(id);
      await this.boundaries.deleteById(id, manager);
    });
  }
}
