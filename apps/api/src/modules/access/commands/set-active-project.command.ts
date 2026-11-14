import type { Principal } from '../access.types';

export class SetActiveProjectCommand {
  constructor(
    public readonly principal: Principal,
    public readonly projectId: string,
  ) {}
}
