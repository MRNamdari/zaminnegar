import type { Principal } from '../auth.types';

export class GetUserQuery {
  constructor(
    public readonly actor: Principal,
    public readonly userId: string,
  ) {}
}
