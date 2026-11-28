import type { Principal } from '../auth.types';

export class ListSystemRolesQuery {
  constructor(public readonly actor: Principal) {}
}
