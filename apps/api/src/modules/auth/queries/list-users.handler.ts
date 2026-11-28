import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AccessPolicyService } from '../abilities/access-policy.service';
import { PaginatedResult } from '../../../common/utils/paginate';
import { User } from '../entities/user.entity';
import { Action, Resource } from '../permissions';
import { UserRepository } from '../repositories/user.repository';
import { ListUsersQuery } from './list-users.query';

@QueryHandler(ListUsersQuery)
export class ListUsersHandler implements IQueryHandler<ListUsersQuery, PaginatedResult<User>> {
  constructor(
    private readonly policy: AccessPolicyService,
    private readonly users: UserRepository,
  ) {}

  execute({ actor, dto }: ListUsersQuery): Promise<PaginatedResult<User>> {
    this.policy.assertSystem(actor, Action.read, Resource.user); // listing everyone is a system-level power
    return this.users.findPage(dto);
  }
}
