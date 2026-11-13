import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { SystemRoleName } from '../permissions';
import { normalizeUsername, USERNAME_PATTERN } from '../utils/account-identifier';
import { maskPhone, normalizeIranMobile } from '../utils/iran-phone';
import { advisoryLock, execute, firstRow, rows } from '../utils/sql';
import { PasswordService } from './password.service';

const MIN_PASSWORD_LENGTH = 10;

/**
 * Makes sure the system has an administrator. When no active, phone-verified superadmin with a password exists, one
 * is created (or an account with the same phone/username is promoted) from ADMIN_USERNAME / ADMIN_PHONE /
 * ADMIN_PASSWORD. The operator who controls the environment is trusted, so the phone counts as verified. Does
 * nothing once a usable superadmin exists, so the variables can be removed afterwards.
 */
@Injectable()
export class SuperadminBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger('Bootstrap');

  constructor(
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
    private readonly passwords: PasswordService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (await this.hasUsableSuperadmin(this.dataSource)) return;

    const rawPhone = this.config.get<string>('ADMIN_PHONE');
    const password = this.config.get<string>('ADMIN_PASSWORD');
    if (!rawPhone || !password) {
      this.logger.warn('No usable superadmin exists. Set ADMIN_PHONE and ADMIN_PASSWORD (and optionally ADMIN_USERNAME, ADMIN_EMAIL) and restart.');
      return;
    }
    const phone = normalizeIranMobile(rawPhone);
    const username = normalizeUsername(this.config.get<string>('ADMIN_USERNAME') || 'admin');
    if (!phone) throw new Error('ADMIN_PHONE is not a valid Iranian mobile number');
    if (!USERNAME_PATTERN.test(username)) throw new Error('ADMIN_USERNAME must be 3-32 characters of a-z, 0-9 and "_", and not only digits');
    if (password.length < MIN_PASSWORD_LENGTH || password.length > 128) {
      throw new Error(`ADMIN_PASSWORD must be ${MIN_PASSWORD_LENGTH}-128 characters`);
    }
    const email = this.config.get<string>('ADMIN_EMAIL')?.trim().toLowerCase() || null;
    const passwordHash = await this.passwords.hash(password);

    await this.dataSource.transaction(async (manager) => {
      await advisoryLock(manager, 'access:bootstrap'); // several instances may start together
      if (await this.hasUsableSuperadmin(manager)) return;

      const role = await firstRow<{ id: string }>(
        manager,
        `SELECT id FROM roles WHERE name = $1 AND scope = 'system' AND project_id IS NULL AND is_system`,
        [SystemRoleName.superadmin],
      );
      if (!role) throw new Error(`Predefined role "${SystemRoleName.superadmin}" is missing; run the migrations`);

      const existing = await rows<{ id: string }>(manager, `SELECT id FROM users WHERE username = $1 OR phone = $2`, [username, phone]);
      if (existing.length > 1) {
        this.logger.error(`ADMIN_USERNAME and ADMIN_PHONE belong to different accounts; fix the configuration or the data.`);
        return;
      }
      if (existing.length === 1) {
        await execute(
          manager,
          `UPDATE users SET password_hash = $2, phone = $3, phone_verified_at = COALESCE(phone_verified_at, now()),
                  is_active = true, system_role_id = $4, failed_login_count = 0, locked_until = NULL, updated_at = now()
           WHERE id = $1`,
          [existing[0].id, passwordHash, phone, role.id],
        );
        this.logger.warn(`Promoted the existing account ${existing[0].id} (${maskPhone(phone)}) to superadmin.`);
        return;
      }
      await execute(
        manager,
        `INSERT INTO users (username, phone, phone_verified_at, email, password_hash, system_role_id)
         VALUES ($1, $2, now(), $3, $4, $5)`,
        [username, phone, email, passwordHash, role.id],
      );
      this.logger.log(`Created the initial superadmin "${username}".`);
    });
  }

  private async hasUsableSuperadmin(db: Pick<DataSource, 'query'>): Promise<boolean> {
    const row = await firstRow<{ present: boolean }>(
      db,
      `SELECT EXISTS (
         SELECT 1 FROM users u JOIN roles r ON r.id = u.system_role_id
         WHERE r.name = $1 AND r.scope = 'system' AND r.project_id IS NULL
           AND u.is_active AND u.phone_verified_at IS NOT NULL AND u.password_hash IS NOT NULL) AS present`,
      [SystemRoleName.superadmin],
    );
    return row?.present === true;
  }
}
