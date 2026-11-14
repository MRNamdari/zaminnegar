import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { AccessPolicyService } from '../abilities/access-policy.service';
import { MemberNotFoundError } from '../errors/member-not-found.error';
import { Action, Resource } from '../permissions';
import { ProjectMemberRepository } from '../repositories/project-member.repository';
import { RoleRepository } from '../repositories/role.repository';
import { ProjectMembershipService } from '../services/project-membership.service';
import { RemoveProjectMemberCommand } from './remove-project-member.command';

/** Removes a member, or lets a member leave: the built-in "own membership" rule allows the latter without any permission. */
@CommandHandler(RemoveProjectMemberCommand)
export class RemoveProjectMemberHandler implements ICommandHandler<RemoveProjectMemberCommand, void> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly policy: AccessPolicyService,
    private readonly roles: RoleRepository,
    private readonly members: ProjectMemberRepository,
    private readonly membership: ProjectMembershipService,
  ) {}

  async execute({ actor, projectId, userId }: RemoveProjectMemberCommand): Promise<void> {
    this.policy.assertCan(actor, Action.delete, Resource.member, { projectId, userId });

    await this.dataSource.transaction(async (manager) => {
      await this.members.lockProjectMembers(projectId, manager);
      const current = await this.members.findOne(projectId, userId, manager);
      if (!current) throw new MemberNotFoundError();

      if (userId !== actor.user.id) {
        const role = await this.roles.findWithPermissions(current.roleId, manager);
        this.policy.assertCanGrant(actor, projectId, role ? this.membership.permissionsOf(role) : []);
      }
      await this.membership.assertOwnerRemainsAfterLeaving(manager, projectId, current.roleId);
      await this.members.remove(projectId, userId, manager);
    });
  }
}
