import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource, EntityManager } from 'typeorm';
import { AccessPolicyService } from '../abilities/access-policy.service';
import { User } from '../entities/user.entity';
import { LastSuperadminError } from '../errors/last-superadmin.error';
import { RoleNotFoundError } from '../errors/role-not-found.error';
import { UserNotFoundError } from '../errors/user-not-found.error';
import { Action, Resource, RoleScope, SystemRoleName, type PermissionRef } from '../permissions';
import { RoleRepository } from '../repositories/role.repository';
import { UserRepository } from '../repositories/user.repository';
import { ProjectMembershipService } from '../services/project-membership.service';
import { SessionService } from '../services/session.service';
import { advisoryLock, firstRow } from '../utils/sql';
import { UpdateUserCommand } from './update-user.command';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand, User> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly policy: AccessPolicyService,
    private readonly users: UserRepository,
    private readonly roles: RoleRepository,
    private readonly membership: ProjectMembershipService,
    private readonly sessions: SessionService,
  ) {}

  async execute({ actor, userId, dto }: UpdateUserCommand): Promise<User> {
    const changing = (['isActive', 'systemRoleId'] as const).filter((field) => dto[field] !== undefined);
    this.policy.assertCan(actor, Action.update, Resource.user, { id: userId });
    this.policy.assertWritable(actor, Action.update, Resource.user, { id: userId }, changing);

    return this.dataSource.transaction(async (manager) => {
      await advisoryLock(manager, 'access:superadmins'); // concurrent demotions must not both pass the last-superadmin check
      const target = await this.users.lockById(userId, manager);
      if (!target) throw new UserNotFoundError();

      // No privilege escalation: you can neither hand out nor take away a system role stronger than your own.
      const currentPermissions = await this.systemPermissionsOf(target.systemRoleId, manager);
      this.policy.assertCanGrantSystem(actor, currentPermissions);
      if (dto.systemRoleId) {
        const role = await this.roles.findWithPermissions(dto.systemRoleId, manager);
        if (!role || role.scope !== RoleScope.system || role.projectId !== null) throw new RoleNotFoundError(dto.systemRoleId);
        this.policy.assertCanGrantSystem(actor, this.membership.permissionsOf(role));
      }

      const losesSuperadmin =
        (dto.isActive === false && target.isActive) || (dto.systemRoleId !== undefined && dto.systemRoleId !== target.systemRoleId);
      if (losesSuperadmin && (await this.isSuperadmin(target, manager)) && (await this.otherActiveSuperadmins(target.id, manager)) === 0) {
        throw new LastSuperadminError();
      }

      await manager.getRepository(User).update(
        { id: userId },
        {
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
          ...(dto.systemRoleId !== undefined ? { systemRoleId: dto.systemRoleId } : {}),
        },
      );
      // Deactivation is a security event: the session ends with it.
      if (dto.isActive === false) await this.sessions.revokeAllForUser(manager, userId);

      const updated = await this.users.findById(userId, manager);
      if (!updated) throw new UserNotFoundError();
      return updated;
    });
  }

  private async systemPermissionsOf(roleId: string | null, manager: EntityManager): Promise<PermissionRef[]> {
    if (!roleId) return [];
    const role = await this.roles.findWithPermissions(roleId, manager);
    return role ? this.membership.permissionsOf(role) : [];
  }

  private async isSuperadmin(target: User, manager: EntityManager): Promise<boolean> {
    if (!target.systemRoleId) return false;
    const role = await this.roles.findById(target.systemRoleId, manager);
    return role?.name === SystemRoleName.superadmin && role.projectId === null;
  }

  private async otherActiveSuperadmins(userId: string, manager: EntityManager): Promise<number> {
    const row = await firstRow<{ count: number }>(
      manager,
      `SELECT count(*)::int AS count FROM users u JOIN roles r ON r.id = u.system_role_id
       WHERE r.name = $2 AND r.scope = 'system' AND r.project_id IS NULL
         AND u.is_active AND u.phone_verified_at IS NOT NULL AND u.id <> $1`,
      [userId, SystemRoleName.superadmin],
    );
    return row?.count ?? 0;
  }
}
