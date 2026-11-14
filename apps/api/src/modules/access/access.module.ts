import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbilityFactory } from './abilities/ability.factory';
import { AccessPolicyService } from './abilities/access-policy.service';
import { ACCESS_CONFIG, loadAccessConfig, type AccessConfig } from './access.config';
import { AccessCommandHandlers } from './commands';
import { AuthController } from './controllers/auth.controller';
import { PermissionsController } from './controllers/permissions.controller';
import { ProjectMembersController } from './controllers/project-members.controller';
import { ProjectRolesController } from './controllers/project-roles.controller';
import { SystemRolesController } from './controllers/system-roles.controller';
import { UsersController } from './controllers/users.controller';
import { OtpChallenge } from './entities/otp-challenge.entity';
import { Permission } from './entities/permission.entity';
import { ProjectMember } from './entities/project-member.entity';
import { RolePermission } from './entities/role-permission.entity';
import { Role } from './entities/role.entity';
import { Session } from './entities/session.entity';
import { User } from './entities/user.entity';
import { PermissionsGuard } from './guards/permissions.guard';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { AccessQueryHandlers } from './queries';
import { PermissionRepository } from './repositories/permission.repository';
import { ProjectMemberRepository } from './repositories/project-member.repository';
import { RoleRepository } from './repositories/role.repository';
import { UserRepository } from './repositories/user.repository';
import { OtpService } from './services/otp.service';
import { PasswordService } from './services/password.service';
import { ProjectMembershipService } from './services/project-membership.service';
import { ResourceLocator } from './services/resource-locator.service';
import { RolePermissionService } from './services/role-permission.service';
import { SessionCookieService } from './services/session-cookie.service';
import { SessionService } from './services/session.service';
import { SuperadminBootstrapService } from './services/superadmin-bootstrap.service';
import { ConsoleSmsGateway } from './sms/console-sms.gateway';
import { SimorghSmsGateway } from './sms/simorgh-sms.gateway';
import { SmsGateway } from './sms/sms.gateway';

/**
 * Authentication (username + password, phone-verified, cookie sessions) and authorization (system and project
 * roles, CASL). Global so that any module can use `@RequirePermission` and the exported services.
 *
 * The delivery of SMS codes is chosen by SMS_DRIVER: `console` (default, development only) or `simorgh`.
 */
@Global()
@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([User, Role, Permission, RolePermission, ProjectMember, Session, OtpChallenge])],
  controllers: [
    AuthController,
    UsersController,
    PermissionsController,
    SystemRolesController,
    ProjectRolesController,
    ProjectMembersController,
  ],
  providers: [
    { provide: ACCESS_CONFIG, inject: [ConfigService], useFactory: (config: ConfigService): AccessConfig => loadAccessConfig(config) },
    {
      provide: SmsGateway,
      inject: [ACCESS_CONFIG, ConfigService],
      useFactory: (access: AccessConfig, config: ConfigService): SmsGateway => {
        if (access.sms.driver === 'simorgh') return new SimorghSmsGateway(config);
        if (config.get<string>('NODE_ENV') === 'production' && !access.sms.allowConsoleInProduction) {
          throw new Error('SMS_DRIVER=console would print one-time codes to the log; configure a real SMS driver for production');
        }
        return new ConsoleSmsGateway();
      },
    },
    UserRepository,
    RoleRepository,
    PermissionRepository,
    ProjectMemberRepository,
    PasswordService,
    OtpService,
    SessionService,
    SessionCookieService,
    ResourceLocator,
    AbilityFactory,
    AccessPolicyService,
    ProjectMembershipService,
    RolePermissionService,
    SuperadminBootstrapService,
    ...AccessCommandHandlers,
    ...AccessQueryHandlers,
    // Order matters: authenticate first, then authorize.
    { provide: APP_GUARD, useClass: SessionAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
  exports: [AccessPolicyService, ProjectMembershipService],
})
export class AccessModule {}
