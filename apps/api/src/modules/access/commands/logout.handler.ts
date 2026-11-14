import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { SessionService } from '../services/session.service';
import { LogoutCommand } from './logout.command';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand, void> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly sessions: SessionService,
  ) {}

  async execute({ sessionId }: LogoutCommand): Promise<void> {
    await this.sessions.revoke(this.dataSource, sessionId);
  }
}
