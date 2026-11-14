import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseRepository } from '../../../common/base/base.repository';
import { escapeLike, paginate, PaginatedResult } from '../../../common/utils/paginate';
import { applyProjectScope } from '../../../common/utils/project-scope';
import { ParcelQueryDto } from '../dto/parcel-query.dto';
import { Parcel } from '../entities/parcel.entity';

export interface ParcelMetricsScope {
  parcelId?: string;
  /** Recalculate every parcel in this region (use after the region's geometry changed). */
  regionId?: string;
  /** Recalculate every parcel in this block (use after the block's geometry changed). */
  blockId?: string;
}

@Injectable()
export class ParcelRepository extends BaseRepository<Parcel> {
  constructor(@InjectRepository(Parcel) repository: Repository<Parcel>) {
    super(repository);
  }

  findByProjectAndName(projectId: string, name: string, manager?: EntityManager): Promise<Parcel | null> {
    return this.repo(manager).findOne({ where: { projectId, name } });
  }

  /** `SELECT ... FOR UPDATE`. Must be called inside a transaction (pass its manager). */
  findByIdForUpdate(id: string, manager: EntityManager): Promise<Parcel | null> {
    return this.repo(manager)
      .createQueryBuilder('parcel')
      .setLock('pessimistic_write')
      .where('parcel.id = :id', { id })
      .getOne();
  }

  /** Every relation of a parcel: project, region, block, boundary and ownerships with their owners. */
  findDetailById(id: string, manager?: EntityManager): Promise<Parcel | null> {
    return this.repo(manager).findOne({
      where: { id },
      relations: { project: true, region: true, block: true, boundary: true, ownerships: { owner: true } },
      order: { ownerships: { createdAt: 'ASC' } },
    });
  }

  /** A page of parcels, each with `region` and `block` joined and `ownershipsCount` filled in. */
  findPage(query: ParcelQueryDto, projectScope: string[] | null = null): Promise<PaginatedResult<Parcel>> {
    const qb = this.repository
      .createQueryBuilder('parcel')
      .leftJoinAndSelect('parcel.region', 'region')
      .leftJoinAndSelect('parcel.block', 'block')
      .loadRelationCountAndMap('parcel.ownershipsCount', 'parcel.ownerships');
    applyProjectScope(qb, 'parcel.projectId', projectScope);
    if (query.projectId) qb.andWhere('parcel.projectId = :projectId', { projectId: query.projectId });
    if (query.regionId) qb.andWhere('parcel.regionId = :regionId', { regionId: query.regionId });
    if (query.blockId) qb.andWhere('parcel.blockId = :blockId', { blockId: query.blockId });
    if (query.status) qb.andWhere('parcel.status = :status', { status: query.status });
    if (query.search) {
      qb.andWhere(`parcel.name ILIKE :search ESCAPE '\\'`, { search: `%${escapeLike(query.search)}%` });
    }
    return paginate(qb.orderBy('parcel.createdAt', 'DESC').addOrderBy('parcel.id', 'ASC'), query);
  }

  /**
   * Recomputes `area_m2`, `region_occupancy_pct` and `block_occupancy_pct` in a single
   * UPDATE from the boundaries' generated areas. Pass at least one scope key.
   * Occupancy = parcel area / container area * 100, capped at 100.
   * Returns the number of parcels updated.
   */
  async recalculateMetrics(scope: ParcelMetricsScope, manager?: EntityManager): Promise<number> {
    if (!scope.parcelId && !scope.regionId && !scope.blockId) {
      throw new Error('recalculateMetrics requires parcelId, regionId or blockId');
    }
    const em = manager ?? this.repository.manager;
    const result = await em.query(
      `
      UPDATE parcels AS p
      SET area_m2 = m.parcel_area,
          region_occupancy_pct = LEAST(100, COALESCE(m.parcel_area / NULLIF(m.region_area, 0) * 100, 0)),
          block_occupancy_pct = CASE
            WHEN p.block_id IS NULL THEN NULL
            ELSE LEAST(100, COALESCE(m.parcel_area / NULLIF(m.block_area, 0) * 100, 0))
          END,
          updated_at = now()
      FROM (
        SELECT src.id,
               pb.area_m2 AS parcel_area,
               rb.area_m2 AS region_area,
               bb.area_m2 AS block_area
        FROM parcels src
        JOIN boundaries pb ON pb.id = src.boundary_id
        JOIN regions r ON r.id = src.region_id
        JOIN boundaries rb ON rb.id = r.boundary_id
        LEFT JOIN blocks b ON b.id = src.block_id
        LEFT JOIN boundaries bb ON bb.id = b.boundary_id
        WHERE ($1::uuid IS NULL OR src.id = $1)
          AND ($2::uuid IS NULL OR src.region_id = $2)
          AND ($3::uuid IS NULL OR src.block_id = $3)
      ) AS m
      WHERE p.id = m.id
      `,
      [scope.parcelId ?? null, scope.regionId ?? null, scope.blockId ?? null],
    );
    // node-postgres via TypeORM returns [rows, affectedCount] for UPDATE.
    return Array.isArray(result) ? (result[1] as number) : 0;
  }
}
