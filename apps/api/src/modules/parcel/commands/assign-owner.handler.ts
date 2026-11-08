import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { ProjectMismatchError } from '../../../common/errors/project-mismatch.error';
import { exceedsFullOwnership, remainingShare } from '../../../common/utils/share';
import { OwnerNotFoundError } from '../../owner/errors/owner-not-found.error';
import { OwnerRepository } from '../../owner/repositories/owner.repository';
import { ParcelOwnership } from '../entities/parcel-ownership.entity';
import { OwnerAlreadyAssignedError } from '../errors/owner-already-assigned.error';
import { ParcelNotFoundError } from '../errors/parcel-not-found.error';
import { SharesExceededError } from '../errors/shares-exceeded.error';
import { ParcelOwnershipRepository } from '../repositories/parcel-ownership.repository';
import { ParcelRepository } from '../repositories/parcel.repository';
import { AssignOwnerCommand } from './assign-owner.command';

@CommandHandler(AssignOwnerCommand)
export class AssignOwnerHandler implements ICommandHandler<AssignOwnerCommand, ParcelOwnership> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly parcels: ParcelRepository,
    private readonly owners: OwnerRepository,
    private readonly ownerships: ParcelOwnershipRepository,
  ) {}

  execute({ parcelId, dto }: AssignOwnerCommand): Promise<ParcelOwnership> {
    return this.dataSource.transaction(async (manager) => {
      // The row lock serializes concurrent share changes on the same parcel.
      const parcel = await this.parcels.findByIdForUpdate(parcelId, manager);
      if (!parcel) throw new ParcelNotFoundError(parcelId);

      const owner = await this.owners.findById(dto.ownerId, manager);
      if (!owner) throw new OwnerNotFoundError(dto.ownerId);
      if (owner.projectId !== parcel.projectId) throw new ProjectMismatchError('owner', owner.id);

      if (await this.ownerships.find(parcelId, dto.ownerId, manager)) {
        throw new OwnerAlreadyAssignedError(parcelId, dto.ownerId);
      }

      const assigned = await this.ownerships.sumSharePct(parcelId, undefined, manager);
      if (exceedsFullOwnership(assigned, dto.sharePct)) {
        throw new SharesExceededError(dto.sharePct, remainingShare(assigned));
      }

      return this.ownerships.save(
        this.ownerships.build({ parcelId, ownerId: dto.ownerId, sharePct: dto.sharePct }),
        manager,
      );
    });
  }
}
