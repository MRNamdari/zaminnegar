import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseRepository } from '../../../common/base/base.repository';
import { escapeLike, paginate, PaginatedResult } from '../../../common/utils/paginate';
import type { E164Phone } from '../access.types';
import { UserQueryDto } from '../dto/user-query.dto';
import { User } from '../entities/user.entity';
import type { AccountIdentifier } from '../utils/account-identifier';
import { execute, firstRow } from '../utils/sql';

export interface LoginCandidate {
  id: string;
  username: string;
  phone: E164Phone | null;
  email: string | null;
  passwordHash: string | null;
  isActive: boolean;
  phoneVerified: boolean;
  locked: boolean;
}

export interface UsableAccount {
  id: string;
  username: string;
  phone: E164Phone;
}

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(@InjectRepository(User) repository: Repository<User>) {
    super(repository);
  }

  /** Everything login needs in one read. `locked` is evaluated by the database clock. */
  findLoginCandidate(username: string): Promise<LoginCandidate | undefined> {
    return firstRow<LoginCandidate>(
      this.repository.manager,
      `SELECT id, username, phone, email, password_hash AS "passwordHash", is_active AS "isActive",
              (phone_verified_at IS NOT NULL) AS "phoneVerified",
              (locked_until IS NOT NULL AND locked_until > now()) AS locked
       FROM users WHERE username = $1`,
      [username],
    );
  }

  /** A verified, active account by username or phone: the only kind that can sign in, reset a password or be invited. */
  findUsable(identifier: AccountIdentifier, manager?: EntityManager): Promise<UsableAccount | undefined> {
    const column = identifier.kind === 'phone' ? 'phone' : 'username';
    const value = identifier.kind === 'phone' ? identifier.phone : identifier.username;
    return firstRow<UsableAccount>(
      manager ?? this.repository.manager,
      `SELECT id, username, phone FROM users
       WHERE ${column} = $1 AND is_active AND phone_verified_at IS NOT NULL`,
      [value],
    );
  }

  /** Locks the user row for the rest of the transaction. */
  lockById(id: string, manager: EntityManager): Promise<User | null> {
    return manager.getRepository(User).findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
  }

  findPage(query: UserQueryDto): Promise<PaginatedResult<User>> {
    const qb = this.repository.createQueryBuilder('user');
    if (query.search) {
      qb.andWhere(`(user.username ILIKE :search ESCAPE '\\' OR user.phone ILIKE :search ESCAPE '\\')`, {
        search: `%${escapeLike(query.search.trim())}%`,
      });
    }
    return paginate(qb.orderBy('user.createdAt', 'DESC').addOrderBy('user.id', 'ASC'), query);
  }

  /** Counts failures atomically; the Nth consecutive failure locks the account and restarts the count. */
  async registerFailedLogin(userId: string, maxFailures: number, lockoutSeconds: number): Promise<void> {
    await execute(
      this.repository.manager,
      `UPDATE users SET
         failed_login_count = CASE WHEN failed_login_count + 1 >= $2 THEN 0 ELSE failed_login_count + 1 END,
         locked_until = CASE WHEN failed_login_count + 1 >= $2 THEN now() + make_interval(secs => $3) ELSE locked_until END
       WHERE id = $1`,
      [userId, maxFailures, lockoutSeconds],
    );
  }

  async clearLoginFailures(userId: string, manager: EntityManager): Promise<void> {
    await execute(
      manager,
      `UPDATE users SET failed_login_count = 0, locked_until = NULL
       WHERE id = $1 AND (failed_login_count <> 0 OR locked_until IS NOT NULL)`,
      [userId],
    );
  }

  async setPasswordHash(userId: string, passwordHash: string, manager?: EntityManager): Promise<void> {
    await execute(
      manager ?? this.repository.manager,
      `UPDATE users SET password_hash = $2, failed_login_count = 0, locked_until = NULL, updated_at = now() WHERE id = $1`,
      [userId, passwordHash],
    );
  }
}
