import type { Principal } from '../auth.types';

export class ListProjectMembersQuery {
  constructor(
    public readonly actor: Principal,
    public readonly projectId: string,
  ) {}
}
