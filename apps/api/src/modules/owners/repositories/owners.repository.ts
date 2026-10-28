import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseRepository } from '../../../common/database/base.repository';
import { handleDatabaseError } from '../../../common/database/handle-database-error';
import { OWNER_CONSTRAINTS } from '../owners.constants';
import { OwnerEntity } from '../entities/owner.entity';
import { OwnerNameAlreadyExistsError } from '../errors/owner-name-already-exists.error';
import type { ICreateOwner, IOwner } from '../interfaces/owner.interface';

@Injectable()
export class OwnersRepository extends BaseRepository<OwnerEntity> {
  constructor(@InjectRepository(OwnerEntity) repository: Repository<OwnerEntity>) {
    super(repository);
  }

  async create(data: ICreateOwner, manager?: EntityManager): Promise<IOwner> {
    const repository = this.getRepository(manager);
    try {
      return await repository.save(repository.create(data));
    } catch (error) {
      return handleDatabaseError(error, {
        [OWNER_CONSTRAINTS.uniqueName]: () => new OwnerNameAlreadyExistsError(data.name),
      });
    }
  }

  async findById(id: string, manager?: EntityManager): Promise<IOwner | null> {
    return this.getRepository(manager).findOneBy({ id });
  }

  async findAll(limit: number, offset: number, manager?: EntityManager): Promise<IOwner[]> {
    return this.getRepository(manager).find({
      order: { createdAt: 'ASC', id: 'ASC' },
      take: limit,
      skip: offset,
    });
  }

  async count(manager?: EntityManager): Promise<number> {
    return this.getRepository(manager).count();
  }
}
