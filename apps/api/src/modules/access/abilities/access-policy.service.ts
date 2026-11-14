import { subject } from '@casl/ability';
import { permittedFieldsOf } from '@casl/ability/extra';
import { Injectable } from '@nestjs/common';
import type { Principal, ResourceAttributes } from '../access.types';
import { FieldNotWritableError } from '../errors/field-not-writable.error';
import { PermissionDeniedError } from '../errors/permission-denied.error';
import { PrivilegeEscalationError } from '../errors/privilege-escalation.error';
import { Action, Resource, type PermissionRef } from '../permissions';
import { ProjectNotFoundError } from '../../project/errors/project-not-found.error';
import { AbilityFactory } from './ability.factory';
import { ALL_FIELDS, type AppAbility } from './app-ability';

/** Attributes that pin a record of `resource` to a project: a project is identified by `id`, everything else by `projectId`. */
export const projectAttributes = (resource: Resource, projectId: string): ResourceAttributes =>
  resource === Resource.project ? { id: projectId } : { projectId };

/**
 * Authorization decisions for application code: guards, command and query handlers. All of them go through the one
 * ability of the principal (see `AbilityFactory`), so a rule is written once and evaluated everywhere the same way.
 * Every check fails closed: no matching rule means no.
 */
@Injectable()
export class AccessPolicyService {
  private readonly abilities = new WeakMap<Principal, AppAbility>();

  constructor(private readonly factory: AbilityFactory) {}

  /** Built once per principal, i.e. once per request. */
  abilityOf(principal: Principal): AppAbility {
    let ability = this.abilities.get(principal);
    if (!ability) {
      ability = this.factory.build(principal);
      this.abilities.set(principal, ability);
    }
    return ability;
  }

  /** May the principal perform `action` on this particular record (described by its attributes)? */
  can(principal: Principal, action: Action, resource: Resource, attributes: ResourceAttributes = {}): boolean {
    return this.abilityOf(principal).can(action, subject(resource, { ...attributes }));
  }

  /** Is the permission held at system level, i.e. for every project? Conditional (project) grants do not count. */
  canSystem(principal: Principal, action: Action, resource: Resource): boolean {
    return this.abilityOf(principal)
      .rulesFor(action, resource)
      .some((rule) => !rule.inverted && !rule.conditions);
  }

  /**
   * May the principal know the project exists? Members may, and so may holders of a system-level permission to read
   * every project (superadmin, auditor). Merely having some system role (such as the default `user`) does not count.
   */
  isRelatedTo(principal: Principal, projectId: string): boolean {
    return principal.memberships.has(projectId) || this.canSystem(principal, Action.read, Resource.project);
  }

  /**
   * Throws unless allowed. A caller with no relationship to the project gets "project not found" instead of
   * "forbidden", so project and resource ids cannot be probed.
   */
  assertCan(principal: Principal, action: Action, resource: Resource, attributes: ResourceAttributes = {}): void {
    if (this.can(principal, action, resource, attributes)) return;
    const projectId = this.projectIdOf(resource, attributes);
    if (projectId && !this.isRelatedTo(principal, projectId)) throw new ProjectNotFoundError(projectId);
    throw new PermissionDeniedError();
  }

  assertSystem(principal: Principal, action: Action, resource: Resource): void {
    if (!this.canSystem(principal, action, resource)) throw new PermissionDeniedError();
  }

  /** The fields of this record the principal may use for `action`, or `'all'`. */
  permittedFields(principal: Principal, action: Action, resource: Resource, attributes: ResourceAttributes = {}): 'all' | string[] {
    const fields = permittedFieldsOf(this.abilityOf(principal), action, subject(resource, { ...attributes }), {
      fieldsFrom: (rule) => rule.fields ?? [ALL_FIELDS],
    });
    return fields.includes(ALL_FIELDS) ? 'all' : fields;
  }

  /** Attribute-level write check: every property being changed must be one the principal may modify on this record. */
  assertWritable(principal: Principal, action: Action, resource: Resource, attributes: ResourceAttributes, fields: readonly string[]): void {
    const allowed = this.permittedFields(principal, action, resource, attributes);
    if (allowed === 'all') return;
    const denied = fields.filter((field) => !allowed.includes(field));
    if (denied.length > 0) throw new FieldNotWritableError(denied);
  }

  /** The projects for which the principal has `action` on `resource`; `null` means all of them (a system-level grant). */
  accessibleProjectIds(principal: Principal, action: Action, resource: Resource): string[] | null {
    if (this.canSystem(principal, action, resource)) return null;
    return [...principal.memberships.keys()].filter((projectId) =>
      this.can(principal, action, resource, projectAttributes(resource, projectId)),
    );
  }

  /**
   * No privilege escalation inside a project: the principal may hand out, change or take away only permissions it
   * holds in that project itself. Applied to the role being assigned, to a custom role's old and new permissions,
   * and to the current role of a member being changed.
   */
  assertCanGrant(principal: Principal, projectId: string, permissions: readonly PermissionRef[]): void {
    const allowed = permissions.every(({ resource, action }) =>
      this.can(principal, action, resource, projectAttributes(resource, projectId)),
    );
    if (!allowed) throw new PrivilegeEscalationError();
  }

  /** Same rule for system roles: the principal must hold every permission of the role at system level. */
  assertCanGrantSystem(principal: Principal, permissions: readonly PermissionRef[]): void {
    if (!permissions.every(({ resource, action }) => this.canSystem(principal, action, resource))) {
      throw new PrivilegeEscalationError();
    }
  }

  private projectIdOf(resource: Resource, attributes: ResourceAttributes): string | null {
    const candidate = resource === Resource.project ? attributes.id : attributes.projectId;
    return typeof candidate === 'string' ? candidate : null;
  }
}
