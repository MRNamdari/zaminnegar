import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { AccessPolicyService, projectAttributes } from '../abilities/access-policy.service';
import type { Role } from '../entities/role.entity';
import { RoleNameTakenError } from '../errors/role-name-taken.error';
import { RoleNotFoundError } from '../errors/role-not-found.error';
import { SystemRoleImmutableError } from '../errors/system-role-immutable.error';
import { Action, Resource } from '../permissions';
import { ProjectMemberRepository } from '../repositories/project-member.repository';
import { RoleRepository } from '../repositories/role.repository';
import { ProjectMembershipService } from '../services/project-membership.service';
import { RolePermissionService } from '../services/role-permission.service';
import { ProjectNotFoundError } from '../../project/errors/project-not-found.error';
import { UpdateProjectRoleCommand } from './update-project-role.command';

@CommandHandler(UpdateProjectRoleCommand)
export class UpdateProjectRoleHandler implements ICommandHandler<UpdateProjectRoleCommand, Role> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly policy: AccessPolicyService,
    private readonly roles: RoleRepository,
    private readonly members: ProjectMemberRepository,
    private readonly membership: ProjectMembershipService,
    private readonly rolePermissions: RolePermissionService,
  ) {}

  async execute({ actor, projectId, roleId, dto }: UpdateProjectRoleCommand): Promise<Role> {
    // Resource-level check: the role must be an instance of *this* project.
    this.policy.assertCan(actor, Action.update, Resource.role, projectAttributes(Resource.role, projectId));

    return this.dataSource.transaction(async (manager) => {
      if (!(await this.members.lockProject(projectId, manager))) throw new ProjectNotFoundError(projectId);

      const role = await this.roles.lockById(roleId, 'pessimistic_write', manager);
      if (!role || (role.projectId !== null && role.projectId !== projectId)) throw new RoleNotFoundError(roleId);
      if (role.isSystem || role.projectId === null) throw new SystemRoleImmutableError(role.name);

      const current = this.membership.permissionsOf((await this.roles.findWithPermissions(roleId, manager)) ?? role);
      const next = dto.permissions ? await this.rolePermissions.resolveForProjectRole(manager, dto.permissions) : current;
      // Neither the old nor the new permissions may exceed the caller's own: no editing a role above your station.
      this.policy.assertCanGrant(actor, projectId, [...current, ...next]);

      if (dto.name !== undefined && dto.name !== role.name) {
        if (await this.roles.nameTakenInProject(projectId, dto.name, role.id, manager)) throw new RoleNameTakenError(dto.name);
        role.name = dto.name;
      }
      if (dto.description !== undefined) role.description = dto.description;
      await this.roles.save(role, manager);
      if (dto.permissions) await this.roles.replacePermissions(role.id, next, manager);

      const updated = await this.roles.findWithPermissions(role.id, manager);
      if (!updated) throw new Error('Role disappeared during update');
      return updated;
    });
  }
}
