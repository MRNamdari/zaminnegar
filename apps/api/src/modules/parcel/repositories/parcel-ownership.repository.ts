import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ParcelOwnership } from '../entities/parcel-ownership.entity';

/** Composite primary key (parcelId, ownerId), so this does not extend BaseRepository. */
@Injectable()
export class ParcelOwnershipRepository {
  constructor(@InjectRepository(ParcelOwnership) private readonly repository: Repository<ParcelOwnership>) {}

  private repo(manager?: EntityManager): Repository<ParcelOwnership> {
    return manager ? manager.getRepository(ParcelOwnership) : this.repository;
  }

  build(data: Partial<ParcelOwnership>): ParcelOwnership {
    return this.repository.create(data);
  }

  find(parcelId: string, ownerId: string, manager?: EntityManager): Promise<ParcelOwnership | null> {
    return this.repo(manager).findOne({ where: { parcelId, ownerId } });
  }

  findByParcel(parcelId: string, manager?: EntityManager): Promise<ParcelOwnership[]> {
    return this.repo(manager).find({ where: { parcelId }, order: { createdAt: 'ASC' } });
  }

  findByOwner(ownerId: string, manager?: EntityManager): Promise<ParcelOwnership[]> {
    return this.repo(manager).find({ where: { ownerId }, order: { createdAt: 'ASC' } });
  }

  /**
   * Sum of all shares of a parcel, optionally excluding one owner (when updating that
   * owner's share). Postgres returns `numeric` as string, hence the conversion.
   * Call it inside the transaction that holds ParcelRepository.findByIdForUpdate.
   */
  async sumSharePct(parcelId: string, excludeOwnerId?: string, manager?: EntityManager): Promise<number> {
    const qb = this.repo(manager)
      .createQueryBuilder('ownership')
      .select('COALESCE(SUM(ownership.sharePct), 0)', 'total')
      .where('ownership.parcelId = :parcelId', { parcelId });
    if (excludeOwnerId) qb.andWhere('ownership.ownerId <> :excludeOwnerId', { excludeOwnerId });
    const row = await qb.getRawOne<{ total: string }>();
    return Number(row?.total ?? 0);
  }

  save(ownership: ParcelOwnership, manager?: EntityManager): Promise<ParcelOwnership> {
    return this.repo(manager).save(ownership);
  }

  async remove(parcelId: string, ownerId: string, manager?: EntityManager): Promise<boolean> {
    const result = await this.repo(manager).delete({ parcelId, ownerId });
    return (result.affected ?? 0) > 0;
  }

  /** Ownerships of a parcel with each `owner` relation loaded (parcel profile view). */
  findByParcelWithOwner(parcelId: string, manager?: EntityManager): Promise<ParcelOwnership[]> {
    return this.repo(manager).find({
      where: { parcelId },
      relations: { owner: true },
      order: { createdAt: 'ASC' },
    });
  }

  /** Ownerships of an owner with each `parcel` relation loaded (highlight all parcels of an owner). */
  findByOwnerWithParcel(ownerId: string, manager?: EntityManager): Promise<ParcelOwnership[]> {
    return this.repo(manager).find({
      where: { ownerId },
      relations: { parcel: true },
      order: { createdAt: 'ASC' },
    });
  }

  countByOwner(ownerId: string, manager?: EntityManager): Promise<number> {
    return this.repo(manager).count({ where: { ownerId } });
  }
}
