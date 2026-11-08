import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseRepository } from '../../../common/base/base.repository';
import { escapeLike, paginate, PaginatedResult } from '../../../common/utils/paginate';
import { RegionQueryDto } from '../dto/region-query.dto';
import { Region } from '../entities/region.entity';

@Injectable()
export class RegionRepository extends BaseRepository<Region> {
  constructor(@InjectRepository(Region) repository: Repository<Region>) {
    super(repository);
  }

  findByProjectAndName(projectId: string, name: string, manager?: EntityManager): Promise<Region | null> {
    return this.repo(manager).findOne({ where: { projectId, name } });
  }

  findByIdWithBoundary(id: string, manager?: EntityManager): Promise<Region | null> {
    return this.repo(manager).findOne({ where: { id }, relations: { boundary: true } });
  }

  findPage(query: RegionQueryDto): Promise<PaginatedResult<Region>> {
    const qb = this.repository.createQueryBuilder('region');
    if (query.projectId) qb.andWhere('region.projectId = :projectId', { projectId: query.projectId });
    if (query.status) qb.andWhere('region.status = :status', { status: query.status });
    if (query.search) {
      qb.andWhere(`region.name ILIKE :search ESCAPE '\\'`, { search: `%${escapeLike(query.search)}%` });
    }
    return paginate(qb.orderBy('region.createdAt', 'DESC').addOrderBy('region.id', 'ASC'), query);
  }

  async countChildren(regionId: string, manager?: EntityManager): Promise<{ blocks: number; parcels: number }> {
    const em = manager ?? this.repository.manager;
    const rows: Array<{ blocks: number; parcels: number }> = await em.query(
      `SELECT (SELECT count(*)::int FROM blocks WHERE region_id = $1) AS blocks,
              (SELECT count(*)::int FROM parcels WHERE region_id = $1) AS parcels`,
      [regionId],
    );
    return { blocks: rows[0]?.blocks ?? 0, parcels: rows[0]?.parcels ?? 0 };
  }
}
