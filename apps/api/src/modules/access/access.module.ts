import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controllers/auth.controller';
import { ProjectMembersController } from './controllers/project-members.controller';
import { RolesController } from './controllers/roles.controller';
import { UsersController } from './controllers/users.controller';
import { OtpChallenge } from './entities/otp-challenge.entity';
import { ProjectMember } from './entities/project-member.entity';
import { RolePermission } from './entities/role-permission.entity';
import { Role } from './entities/role.entity';
import { Session } from './entities/session.entity';
import { User } from './entities/user.entity';
import { GetCurrentUserHandler } from './handlers/get-current-user.handler';
import { LoginWithPasswordHandler } from './handlers/login-with-password.handler';
import { LogoutHandler } from './handlers/logout.handler';
import { RequestOtpHandler } from './handlers/request-otp.handler';
import { VerifyOtpHandler } from './handlers/verify-otp.handler';
import { AuthGuard } from './guards/auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { OtpService } from './otp/otp.service';
import { OTP_SETTINGS, otpSettingsFactory } from './otp/otp.settings';
import { AccessAdminService } from './services/access-admin.service';
import { AdminBootstrapService } from './services/admin-bootstrap.service';
import { AuthorizationService } from './services/authorization.service';
import { PasswordService } from './services/password.service';
import { PhoneUserService } from './services/phone-user.service';
import { SessionService } from './services/session.service';
import { SimorghSmsGateway } from './sms/simorgh-sms.gateway';
import { SmsGateway } from './sms/sms.gateway';

const handlers = [RequestOtpHandler, VerifyOtpHandler, LoginWithPasswordHandler, LogoutHandler, GetCurrentUserHandler];

/**
 * Authentication (opaque session tokens; sign-up and sign-in by SMS one-time code, optional email + password) and
 * authorization (database-backed RBAC, scoped per project).
 * Global, and registers both guards application-wide: every route needs a session unless marked `@Public()`,
 * and a permission unless marked `@AuthenticatedOnly()`.
 */
@Global()
@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([User, Role, RolePermission, ProjectMember, Session, OtpChallenge])],
  controllers: [AuthController, UsersController, RolesController, ProjectMembersController],
  providers: [
    ...handlers,
    PasswordService,
    SessionService,
    AuthorizationService,
    AccessAdminService,
    AdminBootstrapService,
    PhoneUserService,
    OtpService,
    { provide: OTP_SETTINGS, inject: [ConfigService], useFactory: otpSettingsFactory },
    { provide: SmsGateway, useClass: SimorghSmsGateway },
    // Order matters: authenticate first, then authorize.
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
  exports: [AuthorizationService],
})
export class AccessModule {}
