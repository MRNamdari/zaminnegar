import { Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import type { PermissionDto } from '../dto/permission.dto';
import { PermissionNotGrantableError } from '../errors/permission-not-grantable.error';
import { permissionKey, type PermissionRef } from '../permissions';
import { PermissionRepository } from '../repositories/permission.repository';

@Injectable()
export class RolePermissionService {
  constructor(private readonly permissions: PermissionRepository) {}

  /**
   * Checks a requested permission set against the global definitions and removes duplicates. Anything undefined, or
   * defined as system-only, is rejected, so a project role can never carry a system permission.
   */
  async resolveForProjectRole(manager: EntityManager, requested: readonly PermissionDto[]): Promise<PermissionRef[]> {
    const definitions = await this.permissions.findAll(manager);
    const grantable = new Set(definitions.filter((d) => d.projectAssignable).map((d) => permissionKey(d)));

    const unique = new Map<string, PermissionRef>();
    const rejected: string[] = [];
    for (const { resource, action } of requested) {
      const key = permissionKey({ resource, action });
      if (!grantable.has(key)) rejected.push(key);
      else unique.set(key, { resource, action });
    }
    if (rejected.length > 0) throw new PermissionNotGrantableError(rejected);
    return [...unique.values()];
  }
}
