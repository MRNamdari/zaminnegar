import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotAuthenticatedError } from '../errors/not-authenticated.error';
import { SessionService } from '../services/session.service';
import { RenewSessionCommand } from './renew-session.command';
import type { SessionResult } from './session-result';

/** Explicit renewal: a new identifier and a fresh idle deadline. The absolute deadline never moves. */
@CommandHandler(RenewSessionCommand)
export class RenewSessionHandler implements ICommandHandler<RenewSessionCommand, SessionResult> {
  constructor(private readonly sessions: SessionService) {}

  async execute({ principal }: RenewSessionCommand): Promise<SessionResult> {
    const session = await this.sessions.rotate(principal.sessionId);
    if (!session) throw new NotAuthenticatedError();
    const { id, username, phone, email } = principal.user;
    return { session, user: { id, username, phone, email } };
  }
}
