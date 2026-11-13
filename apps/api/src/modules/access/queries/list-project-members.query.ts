import type { Principal } from '../access.types';

export class ListProjectMembersQuery {
  constructor(
    public readonly actor: Principal,
    public readonly projectId: string,
  ) {}
}
