import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Resource } from '../permissions';
import { firstRow } from '../utils/sql';

/**
 * Which project owns a record. Authorization is decided on the project found here, in the database, never on a
 * project id the client claims for an existing record. Table names come from this constant map, not from input.
 */
const PROJECT_ID_SQL: Readonly<Partial<Record<Resource, string>>> = {
  [Resource.project]: 'SELECT id AS "projectId" FROM projects WHERE id = $1',
  [Resource.boundary]: 'SELECT project_id AS "projectId" FROM boundaries WHERE id = $1',
  [Resource.region]: 'SELECT project_id AS "projectId" FROM regions WHERE id = $1',
  [Resource.block]: 'SELECT project_id AS "projectId" FROM blocks WHERE id = $1',
  [Resource.parcel]: 'SELECT project_id AS "projectId" FROM parcels WHERE id = $1',
  [Resource.owner]: 'SELECT project_id AS "projectId" FROM owners WHERE id = $1',
};

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class ResourceLocator {
  constructor(private readonly dataSource: DataSource) {}

  /** The project of record `id` of type `resource`; null when it does not exist or the type has no project (fail closed). */
  async projectIdOf(resource: Resource, id: string): Promise<string | null> {
    const sql = PROJECT_ID_SQL[resource];
    if (!sql || !UUID_PATTERN.test(id)) return null;
    return (await firstRow<{ projectId: string }>(this.dataSource, sql, [id]))?.projectId ?? null;
  }
}
