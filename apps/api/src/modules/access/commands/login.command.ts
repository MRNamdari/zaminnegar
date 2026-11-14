import type { LoginDto } from '../dto/login.dto';
import type { SessionClientInfo } from '../services/session.service';

export class LoginCommand {
  constructor(
    public readonly dto: LoginDto,
    public readonly client: SessionClientInfo,
  ) {}
}
