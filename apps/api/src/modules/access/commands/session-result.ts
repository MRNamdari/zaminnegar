import type { IssuedSession } from '../services/session.service';

/** What login and renewal hand back to the controller: the cookie material and the account to describe. */
export interface SessionResult {
  readonly session: IssuedSession;
  readonly user: {
    readonly id: string;
    readonly username: string;
    readonly phone: string;
    readonly email: string | null;
  };
}
