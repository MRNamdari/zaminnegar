import type { Principal } from '../access.types';

export class DeleteProjectRoleCommand {
  constructor(
    public readonly actor: Principal,
    public readonly projectId: string,
    public readonly roleId: string,
  ) {}
}
