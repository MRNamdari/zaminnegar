import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthContext } from '../access.types';
import { Action, Resource, permissionKey } from '../permissions';

/** Table that holds each resource's `project_id` (projects hold their own id). */
const PROJECT_OF: Partial<Record<Resource, { table: string; column: string }>> = {
  [Resource.project]: { table: 'projects', column: 'id' },
  [Resource.boundary]: { table: 'boundaries', column: 'project_id' },
  [Resource.region]: { table: 'regions', column: 'project_id' },
  [Resource.block]: { table: 'blocks', column: 'project_id' },
  [Resource.parcel]: { table: 'parcels', column: 'project_id' },
  [Resource.owner]: { table: 'owners', column: 'project_id' },
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (value: unknown): value is string => typeof value === 'string' && UUID.test(value);

@Injectable()
export class AuthorizationService {
  constructor(private readonly dataSource: DataSource) {}

  /** `resource:action` on one project (a global role grants it on every project). */
  can(auth: AuthContext, resource: Resource, action: Action, projectId: string | null): boolean {
    const key = permissionKey(resource, action);
    if (auth.globalPermissions.has(key)) return true;
    return projectId !== null && (auth.projectPermissions.get(projectId)?.has(key) ?? false);
  }

  /** True when the caller holds the permission globally or in at least one project. */
  canAnywhere(auth: AuthContext, resource: Resource, action: Action): boolean {
    const key = permissionKey(resource, action);
    if (auth.globalPermissions.has(key)) return true;
    for (const permissions of auth.projectPermissions.values()) if (permissions.has(key)) return true;
    return false;
  }

  /** Projects on which the caller holds the permission; null = all (global role). */
  readableProjectIds(auth: AuthContext, resource: Resource, action: Action): string[] | null {
    const key = permissionKey(resource, action);
    if (auth.globalPermissions.has(key)) return null;
    return [...auth.projectPermissions].filter(([, permissions]) => permissions.has(key)).map(([id]) => id);
  }

  /** The project a resource row belongs to; null when the id is not a uuid or the row does not exist. */
  async projectIdOf(resource: Resource, id: unknown): Promise<string | null> {
    const source = PROJECT_OF[resource];
    if (!source || !isUuid(id)) return null;
    const rows: Array<{ project_id: string }> = await this.dataSource.query(
      `SELECT ${source.column} AS project_id FROM ${source.table} WHERE id = $1`,
      [id],
    );
    return rows[0]?.project_id ?? null;
  }
}
