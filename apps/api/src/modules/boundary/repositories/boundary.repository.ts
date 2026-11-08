import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseRepository } from '../../../common/base/base.repository';
import { BoundaryUsage, FeatureKind } from '../../../common/interfaces/boundary-usage.interface';
import { escapeLike, paginate, PaginatedResult } from '../../../common/utils/paginate';
import { BoundaryQueryDto } from '../dto/boundary-query.dto';
import { Boundary } from '../entities/boundary.entity';

@Injectable()
export class BoundaryRepository extends BaseRepository<Boundary> {
  constructor(@InjectRepository(Boundary) repository: Repository<Boundary>) {
    super(repository);
  }

  /**
   * `area_m2` is a generated column, so it is not populated by INSERT/UPDATE.
   * Save, then re-read to return the row with the computed area.
   */
  async saveAndReload(boundary: Boundary, manager?: EntityManager): Promise<Boundary> {
    const saved = await this.save(boundary, manager);
    return (await this.findById(saved.id, manager)) as Boundary;
  }

  findPage(query: BoundaryQueryDto): Promise<PaginatedResult<Boundary>> {
    const qb = this.repository.createQueryBuilder('boundary');
    if (query.projectId) qb.andWhere('boundary.projectId = :projectId', { projectId: query.projectId });
    if (query.search) {
      qb.andWhere(`boundary.name ILIKE :search ESCAPE '\\'`, { search: `%${escapeLike(query.search)}%` });
    }
    return paginate(qb.orderBy('boundary.createdAt', 'DESC').addOrderBy('boundary.id', 'ASC'), query);
  }

  /** `SELECT ... FOR UPDATE`. Must be called inside a transaction (pass its manager). */
  findByIdForUpdate(id: string, manager: EntityManager): Promise<Boundary | null> {
    return this.repo(manager)
      .createQueryBuilder('boundary')
      .setLock('pessimistic_write')
      .where('boundary.id = :id', { id })
      .getOne();
  }

  /** The region, block or parcel that owns this boundary, or null when it is still a draft. */
  async findUsage(boundaryId: string, manager?: EntityManager): Promise<BoundaryUsage | null> {
    const em = manager ?? this.repository.manager;
    const rows: Array<{
      kind: FeatureKind;
      feature_id: string;
      project_id: string;
      region_id: string;
      block_id: string | null;
    }> = await em.query(
      `
      SELECT 'region'::text AS kind, r.id AS feature_id, r.project_id, r.id AS region_id, NULL::uuid AS block_id
        FROM regions r WHERE r.boundary_id = $1
      UNION ALL
      SELECT 'block'::text, b.id, b.project_id, b.region_id, NULL::uuid
        FROM blocks b WHERE b.boundary_id = $1
      UNION ALL
      SELECT 'parcel'::text, p.id, p.project_id, p.region_id, p.block_id
        FROM parcels p WHERE p.boundary_id = $1
      LIMIT 1
      `,
      [boundaryId],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      kind: row.kind,
      featureId: row.feature_id,
      projectId: row.project_id,
      regionId: row.region_id,
      blockId: row.block_id,
    };
  }
}
