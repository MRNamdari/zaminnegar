import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { AccessPolicyService, projectAttributes } from '../abilities/access-policy.service';
import { RoleInUseError } from '../errors/role-in-use.error';
import { RoleNotFoundError } from '../errors/role-not-found.error';
import { SystemRoleImmutableError } from '../errors/system-role-immutable.error';
import { Action, Resource } from '../permissions';
import { ProjectMemberRepository } from '../repositories/project-member.repository';
import { RoleRepository } from '../repositories/role.repository';
import { ProjectMembershipService } from '../services/project-membership.service';
import { DeleteProjectRoleCommand } from './delete-project-role.command';

@CommandHandler(DeleteProjectRoleCommand)
export class DeleteProjectRoleHandler implements ICommandHandler<DeleteProjectRoleCommand, void> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly policy: AccessPolicyService,
    private readonly roles: RoleRepository,
    private readonly members: ProjectMemberRepository,
    private readonly membership: ProjectMembershipService,
  ) {}

  async execute({ actor, projectId, roleId }: DeleteProjectRoleCommand): Promise<void> {
    this.policy.assertCan(actor, Action.delete, Resource.role, projectAttributes(Resource.role, projectId));

    await this.dataSource.transaction(async (manager) => {
      // The exclusive row lock serializes with role assignment, which takes a shared lock on the same row.
      const role = await this.roles.lockById(roleId, 'pessimistic_write', manager);
      if (!role || (role.projectId !== null && role.projectId !== projectId)) throw new RoleNotFoundError(roleId);
      if (role.isSystem || role.projectId === null) throw new SystemRoleImmutableError(role.name);

      const permissions = this.membership.permissionsOf((await this.roles.findWithPermissions(roleId, manager)) ?? role);
      this.policy.assertCanGrant(actor, projectId, permissions);
      if (await this.members.roleInUse(roleId, manager)) throw new RoleInUseError(role.name);

      await this.roles.deleteById(roleId, manager);
    });
  }
}
