import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { AccessPolicyService, projectAttributes } from '../abilities/access-policy.service';
import { MemberResponseDto } from '../dto/member-response.dto';
import { MemberAlreadyExistsError } from '../errors/member-already-exists.error';
import { UserNotFoundError } from '../errors/user-not-found.error';
import { Action, Resource } from '../permissions';
import { ProjectMemberRepository, type MemberRow } from '../repositories/project-member.repository';
import { UserRepository } from '../repositories/user.repository';
import { ProjectMembershipService } from '../services/project-membership.service';
import { ProjectNotFoundError } from '../../project/errors/project-not-found.error';
import { AddProjectMemberCommand } from './add-project-member.command';

@CommandHandler(AddProjectMemberCommand)
export class AddProjectMemberHandler implements ICommandHandler<AddProjectMemberCommand, MemberResponseDto> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly policy: AccessPolicyService,
    private readonly users: UserRepository,
    private readonly members: ProjectMemberRepository,
    private readonly membership: ProjectMembershipService,
  ) {}

  async execute({ actor, projectId, dto }: AddProjectMemberCommand): Promise<MemberResponseDto> {
    this.policy.assertCan(actor, Action.invite, Resource.member, projectAttributes(Resource.member, projectId));

    return this.dataSource.transaction(async (manager) => {
      if (!(await this.members.lockProject(projectId, manager))) throw new ProjectNotFoundError(projectId);

      // The role comes from the database and must belong to this project (or be predefined): never trusted as sent.
      const role = await this.membership.requireAssignableRole(manager, projectId, dto.roleId);
      this.policy.assertCanGrant(actor, projectId, this.membership.permissionsOf(role));

      const user = await this.users.findUsable({ kind: 'username', username: dto.username }, manager);
      if (!user) throw new UserNotFoundError();

      if (!(await this.members.insert(projectId, user.id, role.id, manager))) throw new MemberAlreadyExistsError();
      const created = await this.members.findOne(projectId, user.id, manager);
      if (!created) throw new Error('Membership was not stored');
      return this.view(actor, projectId, created);
    });
  }

  /** Attribute-level: the caller gets only the fields of the new member that they may read. */
  private view(actor: AddProjectMemberCommand['actor'], projectId: string, row: MemberRow): MemberResponseDto {
    return MemberResponseDto.from(row, this.policy.permittedFields(actor, Action.read, Resource.member, { projectId, userId: row.userId }));
  }
}
