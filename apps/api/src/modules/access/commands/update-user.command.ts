import type { Principal } from '../access.types';
import type { UpdateUserDto } from '../dto/update-user.dto';

export class UpdateUserCommand {
  constructor(
    public readonly actor: Principal,
    public readonly userId: string,
    public readonly dto: UpdateUserDto,
  ) {}
}
