import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionService } from '../../../../common/database/transaction.service';
import { omitUndefined } from '../../../../common/utils/omit-undefined';
import { ParcelNotFoundError } from '../../errors/parcel-not-found.error';
import type { IParcel, IParcelPatch } from '../../interfaces/parcel.interface';
import { ParcelsRepository } from '../../repositories/parcels.repository';
import { ParcelGeometryValidator } from '../../services/parcel-geometry-validator.service';
import { UpdateParcelCommand } from './update-parcel.command';

@CommandHandler(UpdateParcelCommand)
export class UpdateParcelHandler implements ICommandHandler<UpdateParcelCommand> {
  constructor(
    private readonly parcels: ParcelsRepository,
    private readonly geometryValidator: ParcelGeometryValidator,
    private readonly transactions: TransactionService,
  ) {}

  async execute({ projectId, parcelId, patch }: UpdateParcelCommand): Promise<IParcel> {
    const changes: IParcelPatch = omitUndefined(patch);

    return this.transactions.run(async (manager) => {
      if (changes.geometry) await this.geometryValidator.assertValid(changes.geometry, manager);
      if (Object.keys(changes).length > 0) {
        const updated = await this.parcels.update(projectId, parcelId, changes, manager);
        if (!updated) throw new ParcelNotFoundError(parcelId);
      }
      const parcel = await this.parcels.findOne(projectId, parcelId, manager);
      if (!parcel) throw new ParcelNotFoundError(parcelId);
      return parcel;
    });
  }
}
