import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseRepository } from '../../../common/base/base.repository';
import {
  escapeLike,
  paginate,
  PaginatedResult,
} from '../../../common/utils/paginate';
import { applyProjectScope } from '../../../common/utils/project-scope';
import { BlockQueryDto } from '../dto/block-query.dto';
import { Block } from '../entities/block.entity';

@Injectable()
export class BlockRepository extends BaseRepository<Block> {
  constructor(@InjectRepository(Block) repository: Repository<Block>) {
    super(repository);
  }

  findByRegionAndName(
    regionId: string,
    name: string,
    manager?: EntityManager,
  ): Promise<Block | null> {
    return this.repo(manager).findOne({ where: { regionId, name } });
  }

  findByIdWithBoundary(
    id: string,
    manager?: EntityManager,
  ): Promise<Block | null> {
    return this.repo(manager).findOne({
      where: { id },
      relations: { boundary: true },
    });
  }
  findByIdWithParcels(
    id: string,
    manager?: EntityManager,
  ): Promise<Block | null> {
    return this.repo(manager).findOne({
      where: { id },
      relations: { parcels: true },
    });
  }

  /** Every relation of a block: project, region, boundary and parcels (ordered by name). */
  findDetailById(id: string, manager?: EntityManager): Promise<Block | null> {
    return this.repo(manager).findOne({
      where: { id },
      relations: { project: true, region: true, boundary: true, parcels: true },
      order: { parcels: { name: 'ASC' } },
    });
  }

  /** A page of blocks, each with its `region` joined and `parcelsCount` filled in. */
  async findPage(query: BlockQueryDto, projectScope: string[] | null = null): Promise<PaginatedResult<Block>> {
    const qb = this.repository
      .createQueryBuilder('block')
      .leftJoin('block.region', 'region')
      .addSelect('region')
      .loadRelationCountAndMap('block.parcelsCount', 'block.parcels');

    applyProjectScope(qb, 'block.projectId', projectScope);
    if (query.projectId)
      qb.andWhere('block.projectId = :projectId', {
        projectId: query.projectId,
      });
    if (query.regionId)
      qb.andWhere('block.regionId = :regionId', { regionId: query.regionId });
    if (query.status)
      qb.andWhere('block.status = :status', { status: query.status });
    if (query.search) {
      qb.andWhere(`block.name ILIKE :search ESCAPE '\\'`, {
        search: `%${escapeLike(query.search)}%`,
      });
    }

    return paginate(
      qb.orderBy('block.createdAt', 'DESC').addOrderBy('block.id', 'ASC'),
      query,
    );
  }

  async countParcels(
    blockId: string,
    manager?: EntityManager,
  ): Promise<number> {
    const em = manager ?? this.repository.manager;
    const rows: Array<{ parcels: number }> = await em.query(
      `SELECT count(*)::int AS parcels FROM parcels WHERE block_id = $1`,
      [blockId],
    );
    return rows[0]?.parcels ?? 0;
  }
}
