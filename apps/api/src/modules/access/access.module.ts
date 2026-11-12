import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controllers/auth.controller';
import { ProjectMembersController } from './controllers/project-members.controller';
import { RolesController } from './controllers/roles.controller';
import { UsersController } from './controllers/users.controller';
import { ProjectMember } from './entities/project-member.entity';
import { RolePermission } from './entities/role-permission.entity';
import { Role } from './entities/role.entity';
import { Session } from './entities/session.entity';
import { User } from './entities/user.entity';
import { AuthGuard } from './guards/auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { AccessAdminService } from './services/access-admin.service';
import { AuthService } from './services/auth.service';
import { AuthorizationService } from './services/authorization.service';
import { PasswordService } from './services/password.service';
import { SessionService } from './services/session.service';

/**
 * Authentication (opaque session tokens) and authorization (database-backed RBAC, scoped per project).
 * Global, and registers both guards application-wide: every route needs a session unless marked `@Public()`,
 * and a permission unless marked `@AuthenticatedOnly()`.
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      RolePermission,
      ProjectMember,
      Session,
    ]),
  ],
  controllers: [
    AuthController,
    UsersController,
    RolesController,
    ProjectMembersController,
  ],
  providers: [
    PasswordService,
    SessionService,
    AuthorizationService,
    AuthService,
    AccessAdminService,
    // Order matters: authenticate first, then authorize.
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
  exports: [AuthorizationService],
})
export class AccessModule {}
