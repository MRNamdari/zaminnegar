import type { AddMemberDto } from '../dto/add-member.dto';
import type { Principal } from '../auth.types';

export class AddProjectMemberCommand {
  constructor(
    public readonly actor: Principal,
    public readonly projectId: string,
    public readonly dto: AddMemberDto,
  ) {}
}
