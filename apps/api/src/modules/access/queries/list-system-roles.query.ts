import type { Principal } from '../access.types';

export class ListSystemRolesQuery {
  constructor(
    public readonly actor: Principal,
  ) {}
}
