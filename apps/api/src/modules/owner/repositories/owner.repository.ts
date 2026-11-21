import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../common/base/base.repository';
import { applyProjectScope } from '../../../common/utils/project-scope';
import {
  escapeLike,
  PaginatedResult,
} from '../../../common/utils/paginate';
import { OwnerQueryDto } from '../dto/owner-query.dto';
import { Owner } from '../entities/owner.entity';
import { ParcelOwnership } from '../../parcel/entities/parcel-ownership.entity';

@Injectable()
export class OwnerRepository extends BaseRepository<Owner> {
  constructor(@InjectRepository(Owner) repository: Repository<Owner>) {
    super(repository);
  }

  async findPage(
    query: OwnerQueryDto,
    projectScope: string[] | null = null,
  ): Promise<PaginatedResult<Owner>> {
    const qb = this.repository
      .createQueryBuilder('owner')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(DISTINCT po.parcel_id)')
          .from(ParcelOwnership, 'po')
          .where('po.owner_id = owner.id');
      }, 'parcelsCount')
      .addSelect((subQuery) => {
        return subQuery
          .select('COALESCE(SUM(po.share_pct * p.area_m2 / 100), 0)')
          .from(ParcelOwnership, 'po')
          .innerJoin('po.parcel', 'p')
          .where('po.owner_id = owner.id');
      }, 'totalArea');

    applyProjectScope(qb, 'owner.projectId', projectScope);
    if (query.projectId)
      qb.andWhere('owner.projectId = :projectId', {
        projectId: query.projectId,
      });
    if (query.search) {
      qb.andWhere(`owner.name ILIKE :search ESCAPE '\\'`, {
        search: `%${escapeLike(query.search)}%`,
      });
    }
    const pageQuery = qb
      .orderBy('owner.name', 'ASC')
      .addOrderBy('owner.id', 'ASC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit);
    const { entities, raw } = await pageQuery.getRawAndEntities();
    const total = await pageQuery.getCount();

    const items = entities.map((owner, index) => {
      owner.parcelsCount = Number(raw[index].parcelsCount);
      owner.totalArea = Number(raw[index].totalArea);
      return owner;
    });

    return { items, total, page: query.page, limit: query.limit };
  }
}
