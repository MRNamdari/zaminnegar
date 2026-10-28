import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseRepository } from '../../../common/database/base.repository';
import { handleDatabaseError } from '../../../common/database/handle-database-error';
import { BLOCK_CONSTRAINTS, BLOCKS_TABLE } from '../blocks.constants';
import { BlockEntity } from '../entities/block.entity';
import { BlockNameAlreadyExistsError } from '../errors/block-name-already-exists.error';
import type { IBlock, ICreateBlock } from '../interfaces/block.interface';

@Injectable()
export class BlocksRepository extends BaseRepository<BlockEntity> {
  constructor(@InjectRepository(BlockEntity) repository: Repository<BlockEntity>) {
    super(repository);
  }

  async create(data: ICreateBlock, manager?: EntityManager): Promise<IBlock> {
    const repository = this.getRepository(manager);
    try {
      return await repository.save(repository.create(data));
    } catch (error) {
      return handleDatabaseError(error, {
        [BLOCK_CONSTRAINTS.uniqueRegionName]: () => new BlockNameAlreadyExistsError(data.name),
      });
    }
  }

  async findById(id: string, manager?: EntityManager): Promise<IBlock | null> {
    return this.getRepository(manager).findOneBy({ id });
  }

  async findByIdAndRegionId(id: string, regionId: string, manager?: EntityManager): Promise<IBlock | null> {
    return this.getRepository(manager).findOneBy({ id, regionId });
  }

  async findAllByRegionId(regionId: string, limit: number, offset: number, manager?: EntityManager): Promise<IBlock[]> {
    return this.getRepository(manager).find({
      where: { regionId },
      order: { createdAt: 'ASC', id: 'ASC' },
      take: limit,
      skip: offset,
    });
  }

  async countByRegionId(regionId: string, manager?: EntityManager): Promise<number> {
    return this.getRepository(manager).count({ where: { regionId } });
  }

  async count(manager?: EntityManager): Promise<number> {
    return this.getRepository(manager).count();
  }
}
