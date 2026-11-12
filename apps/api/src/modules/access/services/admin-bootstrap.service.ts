import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { normalizeIranMobile } from '../utils/iran-phone';
import { PasswordService } from './password.service';

@Injectable()
export class AdminBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminBootstrapService.name);

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Role) private readonly roles: Repository<Role>,
    private readonly passwords: PasswordService,
    private readonly config: ConfigService,
  ) {}

  /**
   * First start: when no user exists, creates the initial administrator with the global `admin` role, from
   * `ADMIN_PHONE` (signs in by OTP) and/or `ADMIN_EMAIL` + `ADMIN_PASSWORD` (optional password sign-in).
   */
  async onApplicationBootstrap(): Promise<void> {
    const rawPhone = this.config.get<string>('ADMIN_PHONE')?.trim();
    const email = this.config.get<string>('ADMIN_EMAIL')?.trim().toLowerCase() || null;
    const password = this.config.get<string>('ADMIN_PASSWORD') || null;

    const phone = rawPhone ? normalizeIranMobile(rawPhone) : null;
    if (rawPhone && !phone) {
      this.logger.warn('ADMIN_PHONE is not a valid Iranian mobile number; skipping the initial administrator');
      return;
    }
    if (!phone && !(email && password)) return;
    if ((await this.users.count()) > 0) return;

    const admin = await this.roles.findOne({ where: { name: 'admin' } });
    if (!admin) {
      this.logger.warn('An initial administrator is configured but the "admin" role does not exist; run the migrations first');
      return;
    }
    await this.users.save(
      this.users.create({
        phone,
        email,
        name: 'Administrator',
        passwordHash: email && password ? await this.passwords.hash(password) : null,
        globalRoleId: admin.id,
      }),
    );
    this.logger.log(`Created the initial administrator ${phone ?? email}`);
  }
}
