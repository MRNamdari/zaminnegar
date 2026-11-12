import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogoutCommand } from '../commands/auth.commands';
import { SessionService } from '../services/session.service';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand, void> {
  constructor(private readonly sessions: SessionService) {}

  async execute({ auth }: LogoutCommand): Promise<void> {
    await this.sessions.revoke(auth.sessionId);
  }
}
