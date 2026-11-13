import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { AccessPolicyService } from '../abilities/access-policy.service';
import { MemberResponseDto } from '../dto/member-response.dto';
import { MemberNotFoundError } from '../errors/member-not-found.error';
import { Action, Resource } from '../permissions';
import { ProjectMemberRepository } from '../repositories/project-member.repository';
import { RoleRepository } from '../repositories/role.repository';
import { ProjectMembershipService } from '../services/project-membership.service';
import { ProjectNotFoundError } from '../../project/errors/project-not-found.error';
import { ChangeMemberRoleCommand } from './change-member-role.command';

@CommandHandler(ChangeMemberRoleCommand)
export class ChangeMemberRoleHandler implements ICommandHandler<ChangeMemberRoleCommand, MemberResponseDto> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly policy: AccessPolicyService,
    private readonly roles: RoleRepository,
    private readonly members: ProjectMemberRepository,
    private readonly membership: ProjectMembershipService,
  ) {}

  async execute({ actor, projectId, userId, dto }: ChangeMemberRoleCommand): Promise<MemberResponseDto> {
    // Record-level check against the member being changed, and attribute-level: only `roleId` is writable.
    const record = { projectId, userId };
    this.policy.assertCan(actor, Action.update, Resource.member, record);
    this.policy.assertWritable(actor, Action.update, Resource.member, record, ['roleId']);

    return this.dataSource.transaction(async (manager) => {
      if (!(await this.members.lockProject(projectId, manager))) throw new ProjectNotFoundError(projectId);
      await this.members.lockProjectMembers(projectId, manager);

      const current = await this.members.findOne(projectId, userId, manager);
      if (!current) throw new MemberNotFoundError();

      const newRole = await this.membership.requireAssignableRole(manager, projectId, dto.roleId);
      this.policy.assertCanGrant(actor, projectId, this.membership.permissionsOf(newRole));
      // You cannot change someone whose current role holds powers you lack (a manager cannot demote an owner).
      const currentRole = await this.roles.findWithPermissions(current.roleId, manager);
      this.policy.assertCanGrant(actor, projectId, currentRole ? this.membership.permissionsOf(currentRole) : []);

      if (newRole.id !== current.roleId) {
        await this.membership.assertOwnerRemainsAfterLeaving(manager, projectId, current.roleId);
        await this.members.updateRole(projectId, userId, newRole.id, manager);
      }
      const updated = await this.members.findOne(projectId, userId, manager);
      if (!updated) throw new MemberNotFoundError();
      return MemberResponseDto.from(
        updated,
        this.policy.permittedFields(actor, Action.read, Resource.member, { projectId, userId }),
      );
    });
  }
}
