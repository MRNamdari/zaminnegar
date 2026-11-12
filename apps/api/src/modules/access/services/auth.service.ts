import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthContext } from '../access.types';
import { CurrentUserResponseDto, LoginResponseDto, UserResponseDto } from '../dto/user.dto';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { InvalidCredentialsError } from '../errors';
import { PasswordService } from './password.service';
import { SessionService } from './session.service';

const toPermissions = (keys: Iterable<string>) =>
  [...keys].sort().map((key) => {
    const [resource, action] = key.split(':');
    return { resource, action };
  }) as CurrentUserResponseDto['globalPermissions'];

@Injectable()
export class AuthService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Role) private readonly roles: Repository<Role>,
    private readonly passwords: PasswordService,
    private readonly sessions: SessionService,
    private readonly config: ConfigService,
  ) {}

  async login(email: string, password: string, userAgent: string | null): Promise<LoginResponseDto> {
    const user = await this.users
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
    const valid = await this.passwords.verify(password, user?.passwordHash);
    if (!user || !valid || !user.isActive) throw new InvalidCredentialsError();

    const { token, expiresAt } = await this.sessions.create(user.id, userAgent);
    return { token, expiresAt, user: UserResponseDto.from(user) };
  }

  logout(auth: AuthContext): Promise<unknown> {
    return this.sessions.revoke(auth.sessionId);
  }

  me(auth: AuthContext): CurrentUserResponseDto {
    return {
      ...auth.user,
      globalRole: auth.globalRole,
      globalPermissions: toPermissions(auth.globalPermissions),
      memberships: [...auth.memberships].map(([projectId, role]) => ({
        projectId,
        role: { id: role.roleId, name: role.roleName },
        permissions: toPermissions(auth.projectPermissions.get(projectId) ?? []),
      })),
    };
  }

  /**
   * First start: when no user exists and ADMIN_EMAIL / ADMIN_PASSWORD are set, creates that user with the
   * global `admin` role, so there is someone who can create users and projects.
   */
  async onApplicationBootstrap(): Promise<void> {
    const email = this.config.get<string>('ADMIN_EMAIL')?.trim().toLowerCase();
    const password = this.config.get<string>('ADMIN_PASSWORD');
    if (!email || !password) return;
    if ((await this.users.count()) > 0) return;
    const admin = await this.roles.findOne({ where: { name: 'admin' } });
    if (!admin) {
      this.logger.warn('ADMIN_EMAIL is set but the "admin" role does not exist; run the migrations first');
      return;
    }
    await this.users.save(
      this.users.create({ email, name: 'Administrator', passwordHash: await this.passwords.hash(password), globalRoleId: admin.id }),
    );
    this.logger.log(`Created the initial administrator ${email}`);
  }
}
