import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { ACCESS_CONFIG, type AccessConfig } from '../access.config';
import { InvalidCredentialsError } from '../errors/invalid-credentials.error';
import { PhoneNotVerifiedError } from '../errors/phone-not-verified.error';
import { UserInactiveError } from '../errors/user-inactive.error';
import { UserRepository } from '../repositories/user.repository';
import { PasswordService } from '../services/password.service';
import { SessionService } from '../services/session.service';
import { LoginCommand } from './login.command';
import type { SessionResult } from './session-result';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, SessionResult> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly users: UserRepository,
    private readonly passwords: PasswordService,
    private readonly sessions: SessionService,
    @Inject(ACCESS_CONFIG) private readonly config: AccessConfig,
  ) {}

  async execute({ dto, client }: LoginCommand): Promise<SessionResult> {
    const candidate = await this.users.findLoginCandidate(dto.username);
    // One Argon2 verification on every path (a decoy hash when there is nothing to check) keeps timing uniform.
    const check = await this.passwords.verify(candidate?.passwordHash, dto.password);

    if (!candidate || candidate.locked || !check.valid) {
      // Failures count against the account, but not while it is already locked (the lock must not be extendable).
      if (candidate && !candidate.locked) {
        const { maxFailedAttempts, lockoutSeconds } = this.config.login;
        await this.users.registerFailedLogin(candidate.id, maxFailedAttempts, lockoutSeconds);
      }
      throw new InvalidCredentialsError();
    }

    // Past this point the caller knows the password, so telling them about the account's state leaks nothing.
    if (!candidate.isActive) throw new UserInactiveError();
    if (!candidate.phoneVerified || candidate.phone === null) throw new PhoneNotVerifiedError();

    if (check.needsRehash) {
      await this.users.setPasswordHash(candidate.id, await this.passwords.hash(dto.password));
    }

    const session = await this.dataSource.transaction(async (manager) => {
      await this.users.clearLoginFailures(candidate.id, manager);
      return this.sessions.issue(manager, candidate.id, client); // replaces the previous session
    });
    return { session, user: { id: candidate.id, username: candidate.username, phone: candidate.phone, email: candidate.email } };
  }
}
