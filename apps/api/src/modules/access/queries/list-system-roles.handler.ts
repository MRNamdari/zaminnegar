import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AccessPolicyService } from '../abilities/access-policy.service';
import { Role } from '../entities/role.entity';
import { Action, Resource, RoleScope } from '../permissions';
import { RoleRepository } from '../repositories/role.repository';
import { ListSystemRolesQuery } from './list-system-roles.query';

@QueryHandler(ListSystemRolesQuery)
export class ListSystemRolesHandler implements IQueryHandler<ListSystemRolesQuery, Role[]> {
  constructor(
    private readonly policy: AccessPolicyService,
    private readonly roles: RoleRepository,
  ) {}

  execute({ actor }: ListSystemRolesQuery): Promise<Role[]> {
    this.policy.assertSystem(actor, Action.read, Resource.role);
    return this.roles.listPredefined(RoleScope.system);
  }
}
