import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseRepository } from '../../../common/database/base.repository';
import { handleDatabaseError } from '../../../common/database/handle-database-error';
import { SRID_WGS84 } from '../../../common/geometry/geometry.constants';
import type { IMultiPolygon } from '../../../common/geometry/interfaces/multi-polygon.interface';
import { ProjectNotFoundError } from '../../projects/errors/project-not-found.error';
import { ParcelEntity } from '../entities/parcel.entity';
import { InvalidGeometryError } from '../errors/invalid-geometry.error';
import { ParcelNameAlreadyExistsError } from '../errors/parcel-name-already-exists.error';
import type { IGeometryCheck } from '../interfaces/geometry-check.interface';
import type { ICreateParcel, IParcel, IParcelPatch } from '../interfaces/parcel.interface';
import { PARCEL_CONSTRAINTS, PARCEL_DEFAULTS } from '../parcels.constants';

/** Data access for parcels. Every method accepts an optional transaction `manager`. */
@Injectable()
export class ParcelsRepository extends BaseRepository<ParcelEntity> {
  constructor(@InjectRepository(ParcelEntity) repository: Repository<ParcelEntity>) {
    super(repository);
  }

  /**
   * Inserts a parcel and returns its id (the generated `area_m2` is read back by {@link findOne}).
   * @throws ProjectNotFoundError | ParcelNameAlreadyExistsError | InvalidGeometryError
   */
  async create(data: ICreateParcel, manager?: EntityManager): Promise<string> {
    try {
      const result = await this.getRepository(manager).insert({ ...PARCEL_DEFAULTS, notes: null, ...data } as QueryDeepPartialEntity<ParcelEntity>);
      return result.identifiers[0].id as string;
    } catch (error) {
      return handleDatabaseError(error, {
        [PARCEL_CONSTRAINTS.foreignKeyProject]: () => new ProjectNotFoundError(data.projectId),
        [PARCEL_CONSTRAINTS.uniqueProjectName]: () => new ParcelNameAlreadyExistsError(data.name),
        [PARCEL_CONSTRAINTS.checkGeometryValid]: () => new InvalidGeometryError('rejected by database validation'),
      });
    }
  }

  /** Oldest first, served by `idx_parcels_project_id_created_at`. */
  async findAllByProject(projectId: string, manager?: EntityManager): Promise<IParcel[]> {
    return this.getRepository(manager).find({ where: { projectId }, order: { createdAt: 'ASC', id: 'ASC' } });
  }

  /** @returns The parcel, or `null` when it does not exist in that project. */
  async findOne(projectId: string, parcelId: string, manager?: EntityManager): Promise<IParcel | null> {
    return this.getRepository(manager).findOneBy({ id: parcelId, projectId });
  }

  /**
   * Applies a partial update. The patch must contain at least one field.
   * @returns `false` when the parcel does not exist in that project.
   * @throws ParcelNameAlreadyExistsError | InvalidGeometryError
   */
  async update(projectId: string, parcelId: string, patch: IParcelPatch, manager?: EntityManager): Promise<boolean> {
    try {
      const result = await this.getRepository(manager).update({ id: parcelId, projectId }, patch as QueryDeepPartialEntity<ParcelEntity>);
      return (result.affected ?? 0) > 0;
    } catch (error) {
      return handleDatabaseError(error, {
        [PARCEL_CONSTRAINTS.uniqueProjectName]: () => new ParcelNameAlreadyExistsError(patch.name),
        [PARCEL_CONSTRAINTS.checkGeometryValid]: () => new InvalidGeometryError('rejected by database validation'),
      });
    }
  }

  /** @returns `false` when the parcel does not exist in that project. */
  async delete(projectId: string, parcelId: string, manager?: EntityManager): Promise<boolean> {
    const result = await this.getRepository(manager).delete({ id: parcelId, projectId });
    return (result.affected ?? 0) > 0;
  }

  /** @returns The number of deleted parcels. */
  async deleteAllByProject(projectId: string, manager?: EntityManager): Promise<number> {
    const result = await this.getRepository(manager).delete({ projectId });
    return result.affected ?? 0;
  }

  /** Asks PostGIS whether `geometry` is valid (`ST_IsValid`) and how large it is. */
  async checkGeometry(geometry: IMultiPolygon, manager?: EntityManager): Promise<IGeometryCheck> {
    const rows: IGeometryCheck[] = await this.getManager(manager).query(
      `SELECT ST_IsValid(g) AS "isValid",
              ST_IsValidReason(g) AS "reason",
              CASE WHEN ST_IsValid(g) THEN ST_Area(g::geography) ELSE 0 END AS "areaM2"
         FROM (SELECT ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON($1::text), ${SRID_WGS84})) AS g) s`,
      [JSON.stringify(geometry)],
    );
    return rows[0];
  }
}
