import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { TransactionService } from '../../../../common/database/transaction.service';
import { omitUndefined } from '../../../../common/utils/omit-undefined';
import { GetProjectQuery } from '../../../projects/queries/get-project/get-project.query';
import { ParcelNotFoundError } from '../../errors/parcel-not-found.error';
import type { IParcel } from '../../interfaces/parcel.interface';
import { ParcelsRepository } from '../../repositories/parcels.repository';
import { ParcelGeometryValidator } from '../../services/parcel-geometry-validator.service';
import { CreateParcelCommand } from './create-parcel.command';

@CommandHandler(CreateParcelCommand)
export class CreateParcelHandler implements ICommandHandler<CreateParcelCommand> {
  constructor(
    private readonly parcels: ParcelsRepository,
    private readonly geometryValidator: ParcelGeometryValidator,
    private readonly transactions: TransactionService,
    private readonly queryBus: QueryBus,
  ) {}

  async execute({ projectId, input }: CreateParcelCommand): Promise<IParcel> {
    await this.queryBus.execute(new GetProjectQuery(projectId)); // 404 before doing any work

    return this.transactions.run(async (manager) => {
      await this.geometryValidator.assertValid(input.geometry, manager);
      const id = await this.parcels.create({ ...omitUndefined(input), projectId, name: input.name, geometry: input.geometry }, manager);
      const parcel = await this.parcels.findOne(projectId, id, manager);
      if (!parcel) throw new ParcelNotFoundError(id);
      return parcel;
    });
  }
}
