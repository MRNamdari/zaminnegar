import type { Principal } from '../access.types';

export class GetProjectRoleQuery {
  constructor(
    public readonly actor: Principal,
    public readonly projectId: string,
    public readonly roleId: string,
  ) {}
}
