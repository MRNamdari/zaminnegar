import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseRepository } from '../../../common/database/base.repository';
import { handleDatabaseError } from '../../../common/database/handle-database-error';
import { ParcelOwnerEntity } from '../entities/parcel-owner.entity';
import { ParcelOwnerAlreadyExistsError } from '../errors/parcel-owner-already-exists.error';
import type { ICreateParcelOwner, IParcelOwner } from '../interfaces/owner.interface';
import { PARCEL_OWNER_CONSTRAINTS } from '../owners.constants';

@Injectable()
export class ParcelOwnersRepository extends BaseRepository<ParcelOwnerEntity> {
  constructor(@InjectRepository(ParcelOwnerEntity) repository: Repository<ParcelOwnerEntity>) {
    super(repository);
  }

  async create(data: ICreateParcelOwner, manager?: EntityManager): Promise<IParcelOwner> {
    const repository = this.getRepository(manager);
    try {
      return await repository.save(repository.create(data));
    } catch (error) {
      return handleDatabaseError(error, {
        [PARCEL_OWNER_CONSTRAINTS.primaryKey]: () => new ParcelOwnerAlreadyExistsError(data.parcelId, data.ownerId),
      });
    }
  }

  async findByParcelAndOwner(parcelId: string, ownerId: string, manager?: EntityManager): Promise<IParcelOwner | null> {
    return this.getRepository(manager).findOneBy({ parcelId, ownerId });
  }

  async findAllByParcelId(parcelId: string, limit: number, offset: number, manager?: EntityManager): Promise<IParcelOwner[]> {
    return this.getRepository(manager).find({
      where: { parcelId },
      order: { createdAt: 'ASC', ownerId: 'ASC' },
      take: limit,
      skip: offset,
    });
  }

  async findAllByOwnerId(ownerId: string, limit: number, offset: number, manager?: EntityManager): Promise<IParcelOwner[]> {
    return this.getRepository(manager).find({
      where: { ownerId },
      order: { createdAt: 'ASC', parcelId: 'ASC' },
      take: limit,
      skip: offset,
    });
  }

  async countByParcelId(parcelId: string, manager?: EntityManager): Promise<number> {
    return this.getRepository(manager).count({ where: { parcelId } });
  }

  async countByOwnerId(ownerId: string, manager?: EntityManager): Promise<number> {
    return this.getRepository(manager).count({ where: { ownerId } });
  }

  async update(
    parcelId: string,
    ownerId: string,
    patch: Partial<Pick<IParcelOwner, 'share'>>,
    manager?: EntityManager,
  ): Promise<boolean> {
    const result = await this.getRepository(manager).update(
      { parcelId, ownerId },
      patch as QueryDeepPartialEntity<ParcelOwnerEntity>,
    );
    return (result.affected ?? 0) > 0;
  }

  async delete(parcelId: string, ownerId: string, manager?: EntityManager): Promise<void> {
    await this.getRepository(manager).delete({ parcelId, ownerId });
  }
}
