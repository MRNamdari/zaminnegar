import type { Principal } from '../auth.types';

export class ListProjectRolesQuery {
  constructor(
    public readonly actor: Principal,
    public readonly projectId: string,
  ) {}
}
