import { Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import type { Role } from '../entities/role.entity';
import { LastOwnerError } from '../errors/last-owner.error';
import { RoleNotAssignableError } from '../errors/role-not-assignable.error';
import { RoleNotFoundError } from '../errors/role-not-found.error';
import { parsePermission, ProjectRoleName, RoleScope, type PermissionRef } from '../permissions';
import { ProjectMemberRepository } from '../repositories/project-member.repository';
import { RoleRepository } from '../repositories/role.repository';

/** Rules about who may hold which role in a project that more than one handler (and the project module) needs. */
@Injectable()
export class ProjectMembershipService {
  constructor(
    private readonly roles: RoleRepository,
    private readonly members: ProjectMemberRepository,
  ) {}

  /** Makes `userId` the owner of a freshly created project. Call inside the transaction that creates the project. */
  async addOwner(manager: EntityManager, projectId: string, userId: string): Promise<void> {
    const owner = await this.roles.findPredefined(ProjectRoleName.owner, RoleScope.project, manager);
    if (!owner) throw new Error(`Predefined role "${ProjectRoleName.owner}" is missing; run the migrations`);
    await this.members.insert(projectId, userId, owner.id, manager);
  }

  /**
   * Locks and returns a role that may be assigned in `projectId`: a project role that is predefined or belongs to
   * this very project. Any other role, including one of another project, is reported as not found. The shared lock
   * stops the role from being deleted while the assignment commits.
   */
  async requireAssignableRole(manager: EntityManager, projectId: string, roleId: string): Promise<Role> {
    const role = await this.roles.lockById(roleId, 'pessimistic_read', manager);
    if (!role || (role.projectId !== null && role.projectId !== projectId)) throw new RoleNotFoundError(roleId);
    if (role.scope !== RoleScope.project) throw new RoleNotAssignableError();
    role.permissions = (await this.roles.findWithPermissions(roleId, manager))?.permissions ?? [];
    return role;
  }

  /** Throws when removing or demoting a holder of `roleId` would leave the project without an owner. */
  async assertOwnerRemainsAfterLeaving(manager: EntityManager, projectId: string, roleId: string): Promise<void> {
    const owner = await this.roles.findPredefined(ProjectRoleName.owner, RoleScope.project, manager);
    if (!owner || owner.id !== roleId) return;
    if ((await this.members.countWithRole(projectId, owner.id, manager)) <= 1) throw new LastOwnerError();
  }

  permissionsOf(role: Role): PermissionRef[] {
    return (role.permissions ?? []).flatMap((p) => parsePermission(p.resource, p.action) ?? []);
  }
}
