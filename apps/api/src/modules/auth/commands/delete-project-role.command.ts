import type { Principal } from '../auth.types';

export class DeleteProjectRoleCommand {
  constructor(
    public readonly actor: Principal,
    public readonly projectId: string,
    public readonly roleId: string,
  ) {}
}
