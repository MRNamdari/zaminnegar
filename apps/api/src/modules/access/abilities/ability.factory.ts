import { createMongoAbility, type MongoQuery } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import type { Principal } from '../access.types';
import { Action, permissionKey, Resource, type PermissionRef } from '../permissions';
import { PROJECT_FIELD_POLICY, SYSTEM_FIELD_POLICY, type AppAbility, type AppRule } from './app-ability';

/** Conditions that pin a rule to a set of projects. For a `project` record the project is the record itself. */
export function projectConditions(resource: Resource, projectIds: readonly string[]): MongoQuery {
  return resource === Resource.project ? { id: { $in: [...projectIds] } } : { projectId: { $in: [...projectIds] } };
}

/**
 * The single place that turns a principal into authorization rules.
 *
 *   system level   unconditional rules: a system role applies to every project (and to system-only resources)
 *   project level  every rule is pinned to the projects of the memberships that grant it, so a role held in one
 *                  project says nothing about any other
 *   own records    built in, not stored: everyone may read their own account and membership and leave a project
 *
 * Nothing here is derived from request input.
 */
@Injectable()
export class AbilityFactory {
  build(principal: Principal): AppAbility {
    const rules: AppRule[] = [];

    for (const permission of principal.systemPermissions) {
      rules.push(this.rule(permission, null, SYSTEM_FIELD_POLICY));
    }

    // action -> projects where the same permission is held, so each permission becomes one rule
    const byPermission = new Map<string, { permission: PermissionRef; projectIds: string[] }>();
    for (const [projectId, membership] of principal.memberships) {
      for (const permission of membership.permissions) {
        const key = permissionKey(permission);
        const entry = byPermission.get(key) ?? { permission, projectIds: [] };
        entry.projectIds.push(projectId);
        byPermission.set(key, entry);
      }
    }
    for (const { permission, projectIds } of byPermission.values()) {
      rules.push(this.rule(permission, projectIds, PROJECT_FIELD_POLICY));
    }

    const userId = principal.user.id;
    rules.push(
      { action: Action.read, subject: Resource.user, conditions: { id: userId } },
      { action: Action.read, subject: Resource.member, conditions: { userId } },
      { action: Action.delete, subject: Resource.member, conditions: { userId } },
    );

    return createMongoAbility<AppAbility>(rules);
  }

  private rule(
    { resource, action }: PermissionRef,
    projectIds: readonly string[] | null,
    fieldPolicy: Readonly<Record<string, readonly string[]>>,
  ): AppRule {
    const fields = fieldPolicy[permissionKey({ resource, action })];
    return {
      action,
      subject: resource,
      ...(fields ? { fields: [...fields] } : {}),
      ...(projectIds ? { conditions: projectConditions(resource, projectIds) } : {}),
    };
  }
}
