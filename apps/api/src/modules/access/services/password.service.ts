import { Inject, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { randomBytes } from 'node:crypto';
import { ACCESS_CONFIG, type AccessConfig } from '../access.config';

export interface PasswordCheck {
  readonly valid: boolean;
  /** The stored hash uses weaker parameters than the current configuration; store a fresh hash. */
  readonly needsRehash: boolean;
}

/** Argon2id with explicit, configurable parameters. The `argon2` package does the work; nothing is hand-rolled. */
@Injectable()
export class PasswordService {
  private decoyHash: Promise<string> | undefined;

  constructor(@Inject(ACCESS_CONFIG) private readonly config: AccessConfig) {}

  private get options(): argon2.HashOptions {
    const { memoryCostKib, timeCost, parallelism } = this.config.password;
    return { type: argon2.argon2id, memoryCost: memoryCostKib, timeCost, parallelism };
  }

  hash(password: string): Promise<string> {
    return argon2.hash(password, this.options);
  }

  /**
   * Always performs one Argon2 verification, even when there is no stored hash (unknown user, cleared password),
   * so response time does not reveal whether the account exists.
   */
  async verify(storedHash: string | null | undefined, password: string): Promise<PasswordCheck> {
    this.decoyHash ??= this.hash(randomBytes(16).toString('hex'));
    const target = storedHash ?? (await this.decoyHash);
    let matches = false;
    try {
      matches = await argon2.verify(target, password);
    } catch {
      matches = false; // malformed hash: treat as a failed login, never as an error that distinguishes accounts
    }
    const valid = matches && storedHash != null;
    return { valid, needsRehash: valid && argon2.needsRehash(target, this.options) };
  }
}
