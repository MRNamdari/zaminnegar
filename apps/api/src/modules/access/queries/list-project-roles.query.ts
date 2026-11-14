import type { Principal } from '../access.types';

export class ListProjectRolesQuery {
  constructor(
    public readonly actor: Principal,
    public readonly projectId: string,
  ) {}
}
