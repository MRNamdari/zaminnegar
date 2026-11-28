import type { Principal } from '@/modules/auth/auth.types';

export class DeleteMapFeatureCommand {
  constructor(
    public readonly id: string,
    public readonly principal: Principal,
  ) {}
}
