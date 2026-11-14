import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { exceedsFullOwnership, remainingShare } from '../../../common/utils/share';
import { ParcelOwnership } from '../entities/parcel-ownership.entity';
import { OwnershipNotFoundError } from '../errors/ownership-not-found.error';
import { ParcelNotFoundError } from '../errors/parcel-not-found.error';
import { SharesExceededError } from '../errors/shares-exceeded.error';
import { ParcelOwnershipRepository } from '../repositories/parcel-ownership.repository';
import { ParcelRepository } from '../repositories/parcel.repository';
import { UpdateOwnershipCommand } from './update-ownership.command';

@CommandHandler(UpdateOwnershipCommand)
export class UpdateOwnershipHandler implements ICommandHandler<UpdateOwnershipCommand, ParcelOwnership> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly parcels: ParcelRepository,
    private readonly ownerships: ParcelOwnershipRepository,
  ) {}

  execute({ parcelId, ownerId, dto }: UpdateOwnershipCommand): Promise<ParcelOwnership> {
    return this.dataSource.transaction(async (manager) => {
      if (!(await this.parcels.findByIdForUpdate(parcelId, manager))) throw new ParcelNotFoundError(parcelId);

      const ownership = await this.ownerships.find(parcelId, ownerId, manager);
      if (!ownership) throw new OwnershipNotFoundError(parcelId, ownerId);

      const others = await this.ownerships.sumSharePct(parcelId, ownerId, manager);
      if (exceedsFullOwnership(others, dto.sharePct)) {
        throw new SharesExceededError(dto.sharePct, remainingShare(others));
      }

      ownership.sharePct = dto.sharePct;
      return this.ownerships.save(ownership, manager);
    });
  }
}
