import type { Principal } from '../../access/access.types';

export class DeleteMapFeatureCommand {
  constructor(
    public readonly id: string,
    public readonly principal: Principal,
  ) {}
}
