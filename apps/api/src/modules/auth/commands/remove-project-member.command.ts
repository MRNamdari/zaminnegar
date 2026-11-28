import type { Principal } from '../auth.types';

export class RemoveProjectMemberCommand {
  constructor(
    public readonly actor: Principal,
    public readonly projectId: string,
    public readonly userId: string,
  ) {}
}
