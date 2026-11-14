import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AccessPolicyService, projectAttributes } from '../abilities/access-policy.service';
import { Role } from '../entities/role.entity';
import { RoleNotFoundError } from '../errors/role-not-found.error';
import { Action, Resource, RoleScope } from '../permissions';
import { RoleRepository } from '../repositories/role.repository';
import { GetProjectRoleQuery } from './get-project-role.query';

@QueryHandler(GetProjectRoleQuery)
export class GetProjectRoleHandler implements IQueryHandler<GetProjectRoleQuery, Role> {
  constructor(
    private readonly policy: AccessPolicyService,
    private readonly roles: RoleRepository,
  ) {}

  async execute({ actor, projectId, roleId }: GetProjectRoleQuery): Promise<Role> {
    this.policy.assertCan(actor, Action.read, Resource.role, projectAttributes(Resource.role, projectId));
    const role = await this.roles.findWithPermissions(roleId);
    // A custom role of another project is indistinguishable from a role that does not exist.
    if (!role || role.scope !== RoleScope.project || (role.projectId !== null && role.projectId !== projectId)) {
      throw new RoleNotFoundError(roleId);
    }
    return role;
  }
}
