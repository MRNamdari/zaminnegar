import type { Principal } from '../auth.types';

export class SetActiveProjectCommand {
  constructor(
    public readonly principal: Principal,
    public readonly projectId: string,
  ) {}
}
