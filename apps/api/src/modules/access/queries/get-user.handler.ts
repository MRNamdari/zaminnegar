import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AccessPolicyService } from '../abilities/access-policy.service';
import { User } from '../entities/user.entity';
import { UserNotFoundError } from '../errors/user-not-found.error';
import { Action, Resource } from '../permissions';
import { UserRepository } from '../repositories/user.repository';
import { GetUserQuery } from './get-user.query';

/** Ownership-level rule: anyone may read their own account, system roles with `user:read` may read any. */
@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery, User> {
  constructor(
    private readonly policy: AccessPolicyService,
    private readonly users: UserRepository,
  ) {}

  async execute({ actor, userId }: GetUserQuery): Promise<User> {
    // Decided on the id alone, before any lookup, so a refusal says nothing about whether the account exists.
    this.policy.assertCan(actor, Action.read, Resource.user, { id: userId });
    const user = await this.users.findById(userId);
    if (!user) throw new UserNotFoundError();
    return user;
  }
}
