import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ParcelNotFoundError } from '../../errors/parcel-not-found.error';
import { ParcelsRepository } from '../../repositories/parcels.repository';
import { DeleteParcelCommand } from './delete-parcel.command';

@CommandHandler(DeleteParcelCommand)
export class DeleteParcelHandler implements ICommandHandler<DeleteParcelCommand> {
  constructor(private readonly parcels: ParcelsRepository) {}

  async execute({ projectId, parcelId }: DeleteParcelCommand): Promise<void> {
    if (!(await this.parcels.delete(projectId, parcelId))) throw new ParcelNotFoundError(parcelId);
  }
}
