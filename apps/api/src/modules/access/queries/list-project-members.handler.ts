import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AccessPolicyService, projectAttributes } from '../abilities/access-policy.service';
import { MemberResponseDto } from '../dto/member-response.dto';
import { Action, Resource } from '../permissions';
import { ProjectMemberRepository } from '../repositories/project-member.repository';
import { ListProjectMembersQuery } from './list-project-members.query';

@QueryHandler(ListProjectMembersQuery)
export class ListProjectMembersHandler implements IQueryHandler<ListProjectMembersQuery, MemberResponseDto[]> {
  constructor(
    private readonly policy: AccessPolicyService,
    private readonly members: ProjectMemberRepository,
  ) {}

  async execute({ actor, projectId }: ListProjectMembersQuery): Promise<MemberResponseDto[]> {
    this.policy.assertCan(actor, Action.read, Resource.member, projectAttributes(Resource.member, projectId));
    const rows = await this.members.listByProject(projectId);
    // Attribute-level: each row keeps only the fields the caller may read (contact details: own row or system level).
    return rows.map((row) =>
      MemberResponseDto.from(row, this.policy.permittedFields(actor, Action.read, Resource.member, { projectId, userId: row.userId })),
    );
  }
}
