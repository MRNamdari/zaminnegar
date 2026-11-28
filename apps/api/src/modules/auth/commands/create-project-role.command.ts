import type { CreateRoleDto } from '../dto/create-role.dto';
import type { Principal } from '../auth.types';

export class CreateProjectRoleCommand {
  constructor(
    public readonly actor: Principal,
    public readonly projectId: string,
    public readonly dto: CreateRoleDto,
  ) {}
}
