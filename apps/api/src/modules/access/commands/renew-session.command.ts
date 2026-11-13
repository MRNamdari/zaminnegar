import type { Principal } from '../access.types';

export class RenewSessionCommand {
  constructor(
    public readonly principal: Principal,
  ) {}
}
