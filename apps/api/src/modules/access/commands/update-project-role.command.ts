import type { Principal } from '../access.types';
import type { UpdateRoleDto } from '../dto/update-role.dto';

export class UpdateProjectRoleCommand {
  constructor(
    public readonly actor: Principal,
    public readonly projectId: string,
    public readonly roleId: string,
    public readonly dto: UpdateRoleDto,
  ) {}
}
