import type { Principal } from '../access.types';

export class GetUserQuery {
  constructor(
    public readonly actor: Principal,
    public readonly userId: string,
  ) {}
}
