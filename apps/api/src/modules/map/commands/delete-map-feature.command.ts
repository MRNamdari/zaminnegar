import type { Principal } from '@/modules/access/access.types';

export class DeleteMapFeatureCommand {
  constructor(
    public readonly id: string,
    public readonly principal: Principal,
  ) {}
}
