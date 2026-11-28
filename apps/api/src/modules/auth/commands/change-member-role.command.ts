import type { Principal } from '../auth.types';
import type { UpdateMemberDto } from '../dto/update-member.dto';

export class ChangeMemberRoleCommand {
  constructor(
    public readonly actor: Principal,
    public readonly projectId: string,
    public readonly userId: string,
    public readonly dto: UpdateMemberDto,
  ) {}
}
