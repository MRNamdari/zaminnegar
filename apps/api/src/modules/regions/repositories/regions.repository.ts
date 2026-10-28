import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseRepository } from '../../../common/database/base.repository';
import { handleDatabaseError } from '../../../common/database/handle-database-error';
import { PARCELS_TABLE } from '../../parcels/parcels.constants';
import { RegionEntity } from '../entities/region.entity';
import { RegionNameAlreadyExistsError } from '../errors/region-name-already-exists.error';
import type { ICreateRegion, IRegion } from '../interfaces/region.interface';
import type { IRegionWithStats } from '../interfaces/region-with-stats.interface';
import { REGION_CONSTRAINTS, REGIONS_TABLE } from '../regions.constants';

/**
 * Regions with parcel count and extent. The lateral subquery runs once per
 * returned region and is served by `idx_parcels_region_id_created_at` / the GiST index.
 */
const STATS_SELECT = `
  SELECT p.id, p.name, p.description, p.territory,
         p.created_at AS "createdAt", p.updated_at AS "updatedAt",
         s.parcel_count::int AS "parcelCount", s.extent
    FROM ${REGIONS_TABLE} p
   CROSS JOIN LATERAL (
         SELECT count(*) AS parcel_count,
                CASE WHEN count(*) = 0 THEN NULL
                     ELSE ARRAY[ST_XMin(ST_Extent(c.geom)), ST_YMin(ST_Extent(c.geom)),
                                ST_XMax(ST_Extent(c.geom)), ST_YMax(ST_Extent(c.geom))]
                END AS extent
           FROM ${PARCELS_TABLE} c
          WHERE c.block_id IN (
            SELECT b.id FROM blocks b WHERE b.region_id = p.id
          )) s`;

/** Data access for regions. Every method accepts an optional transaction `manager`. */
@Injectable()
export class RegionsRepository extends BaseRepository<RegionEntity> {
  constructor(
    @InjectRepository(RegionEntity) repository: Repository<RegionEntity>,
  ) {
    super(repository);
  }

  /**
   * Inserts a region.
   * @throws RegionNameAlreadyExistsError when the name is taken.
   */
  async create(data: ICreateRegion, manager?: EntityManager): Promise<IRegion> {
    const repository = this.getRepository(manager);
    try {
      return await repository.save(repository.create(data));
    } catch (error) {
      return handleDatabaseError(error, {
        [REGION_CONSTRAINTS.uniqueName]: () =>
          new RegionNameAlreadyExistsError(data.name),
      });
    }
  }

  async findById(id: string, manager?: EntityManager): Promise<IRegion | null> {
    return this.getRepository(manager).findOneBy({ id });
  }

  /** @returns The region with aggregates, or `null` when it does not exist. */
  async findByIdWithStats(
    id: string,
    manager?: EntityManager,
  ): Promise<IRegionWithStats | null> {
    const rows: IRegionWithStats[] = await this.getManager(manager).query(
      `${STATS_SELECT} WHERE p.id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  /** Most recently changed regions first (served by `idx_regions_updated_at`). */
  async findAllWithStats(
    limit: number,
    offset: number,
    manager?: EntityManager,
  ): Promise<IRegionWithStats[]> {
    return this.getManager(manager).query(
      `${STATS_SELECT} ORDER BY p.updated_at DESC, p.id LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
  }

  async update(
    id: string,
    patch: Partial<Pick<IRegion, 'name' | 'description' | 'territory'>>,
    manager?: EntityManager,
  ): Promise<boolean> {
    try {
      const result = await this.getRepository(manager).update(
        { id },
        patch as QueryDeepPartialEntity<RegionEntity>,
      );
      return (result.affected ?? 0) > 0;
    } catch (error) {
      return handleDatabaseError(error, {
        [REGION_CONSTRAINTS.uniqueName]: () => new RegionNameAlreadyExistsError(patch.name ?? ''),
      });
    }
  }

  async delete(id: string, manager?: EntityManager): Promise<boolean> {
    const result = await this.getRepository(manager).delete({ id });
    return (result.affected ?? 0) > 0;
  }

  /** Total number of regions. */
  async count(manager?: EntityManager): Promise<number> {
    return this.getRepository(manager).count();
  }
}
