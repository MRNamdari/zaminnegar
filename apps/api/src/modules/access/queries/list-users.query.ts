import type { Principal } from '../access.types';
import type { UserQueryDto } from '../dto/user-query.dto';

export class ListUsersQuery {
  constructor(
    public readonly actor: Principal,
    public readonly dto: UserQueryDto,
  ) {}
}
