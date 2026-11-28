import type { Principal } from '../auth.types';

export class RenewSessionCommand {
  constructor(public readonly principal: Principal) {}
}
