import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AccessPolicyService, projectAttributes } from '../abilities/access-policy.service';
import { Role } from '../entities/role.entity';
import { Action, Resource } from '../permissions';
import { RoleRepository } from '../repositories/role.repository';
import { ListProjectRolesQuery } from './list-project-roles.query';

@QueryHandler(ListProjectRolesQuery)
export class ListProjectRolesHandler implements IQueryHandler<ListProjectRolesQuery, Role[]> {
  constructor(
    private readonly policy: AccessPolicyService,
    private readonly roles: RoleRepository,
  ) {}

  execute({ actor, projectId }: ListProjectRolesQuery): Promise<Role[]> {
    this.policy.assertCan(actor, Action.read, Resource.role, projectAttributes(Resource.role, projectId));
    return this.roles.listForProject(projectId); // the project's own roles and the shared predefined ones, never another project's
  }
}
