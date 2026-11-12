import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { escapeLike, paginate, PaginatedResult } from '../../../common/utils/paginate';
import { ProjectNotFoundError } from '../../project/errors/project-not-found.error';
import { AddMemberDto, MemberResponseDto, UpdateMemberDto } from '../dto/member.dto';
import { CreateRoleDto, UpdateRoleDto } from '../dto/role.dto';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from '../dto/user.dto';
import { Role } from '../entities/role.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { User } from '../entities/user.entity';
import {
  EmailTakenError,
  MemberAlreadyExistsError,
  MemberNotFoundError,
  RoleNameTakenError,
  RoleNotFoundError,
  RoleScopeMismatchError,
  SystemRoleImmutableError,
  UserNotFoundError,
} from '../errors';
import { isGrantableToProjectRole, RoleScope } from '../permissions';
import { PasswordService } from './password.service';
import { SessionService } from './session.service';

/** Users, roles and project memberships: the administrative side of RBAC. */
@Injectable()
export class AccessAdminService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Role) private readonly roles: Repository<Role>,
    private readonly passwords: PasswordService,
    private readonly sessions: SessionService,
  ) {}

  // ---------------------------------------------------------------- users

  async createUser(dto: CreateUserDto): Promise<User> {
    if (await this.users.existsBy({ email: dto.email })) throw new EmailTakenError(dto.email);
    if (dto.globalRoleId) await this.requireRole(dto.globalRoleId, RoleScope.global);
    const user = await this.users.save(
      this.users.create({
        email: dto.email,
        name: dto.name,
        passwordHash: await this.passwords.hash(dto.password),
        globalRoleId: dto.globalRoleId ?? null,
      }),
    );
    return this.getUser(user.id);
  }

  listUsers(query: UserQueryDto): Promise<PaginatedResult<User>> {
    const qb = this.users.createQueryBuilder('user');
    if (query.search) {
      qb.andWhere(`(user.name ILIKE :search ESCAPE '\\' OR user.email ILIKE :search ESCAPE '\\')`, {
        search: `%${escapeLike(query.search)}%`,
      });
    }
    return paginate(qb.orderBy('user.name', 'ASC').addOrderBy('user.id', 'ASC'), query);
  }

  async getUser(id: string): Promise<User> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new UserNotFoundError(id);
    return user;
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.getUser(id);
    if (dto.name !== undefined) user.name = dto.name;
    if (dto.globalRoleId !== undefined) {
      if (dto.globalRoleId !== null) await this.requireRole(dto.globalRoleId, RoleScope.global);
      user.globalRoleId = dto.globalRoleId;
    }
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    if (dto.password !== undefined) user.passwordHash = await this.passwords.hash(dto.password);
    await this.users.save(user);
    // Roles are loaded per request, but sessions must not outlive a credential or status change.
    if (dto.password !== undefined || dto.isActive === false) await this.sessions.revokeAllOf(id);
    return this.getUser(id);
  }

  async deleteUser(id: string): Promise<void> {
    await this.getUser(id);
    await this.users.delete({ id });
  }

  // ---------------------------------------------------------------- roles

  async listRoles(): Promise<Array<Role & { permissions: RolePermission[] }>> {
    return (await this.roles.find({ relations: { permissions: true }, order: { scope: 'ASC', name: 'ASC' } })) as Array<
      Role & { permissions: RolePermission[] }
    >;
  }

  async getRole(id: string): Promise<Role & { permissions: RolePermission[] }> {
    const role = await this.roles.findOne({ where: { id }, relations: { permissions: true } });
    if (!role) throw new RoleNotFoundError(id);
    return role as Role & { permissions: RolePermission[] };
  }

  async createRole(dto: CreateRoleDto): Promise<Role & { permissions: RolePermission[] }> {
    if (await this.roles.existsBy({ name: dto.name })) throw new RoleNameTakenError(dto.name);
    this.assertGrantable(dto.scope, dto.permissions);
    const id = await this.dataSource.transaction(async (manager) => {
      const role = await manager.getRepository(Role).save(
        manager.getRepository(Role).create({ name: dto.name, description: dto.description ?? '', scope: dto.scope }),
      );
      await this.replacePermissions(manager.getRepository(RolePermission), role.id, dto.permissions);
      return role.id;
    });
    return this.getRole(id);
  }

  async updateRole(id: string, dto: UpdateRoleDto): Promise<Role & { permissions: RolePermission[] }> {
    const role = await this.getRole(id);
    if (role.isSystem) throw new SystemRoleImmutableError(role.name);
    if (dto.name !== undefined && dto.name !== role.name && (await this.roles.existsBy({ name: dto.name }))) {
      throw new RoleNameTakenError(dto.name);
    }
    if (dto.permissions) this.assertGrantable(role.scope, dto.permissions);
    await this.dataSource.transaction(async (manager) => {
      const patch: Partial<Pick<Role, 'name' | 'description'>> = {};
      if (dto.name !== undefined) patch.name = dto.name;
      if (dto.description !== undefined) patch.description = dto.description;
      if (Object.keys(patch).length > 0) await manager.getRepository(Role).update({ id }, patch);
      if (dto.permissions) await this.replacePermissions(manager.getRepository(RolePermission), id, dto.permissions);
    });
    return this.getRole(id);
  }

  /** Fails with 409 (see DatabaseExceptionFilter) while users or memberships still use the role. */
  async deleteRole(id: string): Promise<void> {
    const role = await this.getRole(id);
    if (role.isSystem) throw new SystemRoleImmutableError(role.name);
    await this.roles.delete({ id });
  }

  // -------------------------------------------------------------- members

  async listMembers(projectId: string): Promise<MemberResponseDto[]> {
    await this.requireProject(projectId);
    return this.memberRows(projectId);
  }

  async addMember(projectId: string, dto: AddMemberDto): Promise<MemberResponseDto> {
    await this.requireProject(projectId);
    await this.getUser(dto.userId);
    await this.requireRole(dto.roleId, RoleScope.project);
    const existing = await this.dataSource.query(`SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2`, [
      projectId,
      dto.userId,
    ]);
    if (existing.length > 0) throw new MemberAlreadyExistsError(projectId, dto.userId);
    await this.dataSource.query(`INSERT INTO project_members (user_id, project_id, role_id) VALUES ($1, $2, $3)`, [
      dto.userId,
      projectId,
      dto.roleId,
    ]);
    return (await this.memberRows(projectId, dto.userId))[0] as MemberResponseDto;
  }

  async updateMember(projectId: string, userId: string, dto: UpdateMemberDto): Promise<MemberResponseDto> {
    await this.requireRole(dto.roleId, RoleScope.project);
    const result: [unknown[], number] = await this.dataSource.query(
      `UPDATE project_members SET role_id = $3, updated_at = now() WHERE project_id = $1 AND user_id = $2`,
      [projectId, userId, dto.roleId],
    );
    if (!result[1]) throw new MemberNotFoundError(projectId, userId);
    return (await this.memberRows(projectId, userId))[0] as MemberResponseDto;
  }

  async removeMember(projectId: string, userId: string): Promise<void> {
    const result: [unknown[], number] = await this.dataSource.query(
      `DELETE FROM project_members WHERE project_id = $1 AND user_id = $2`,
      [projectId, userId],
    );
    if (!result[1]) throw new MemberNotFoundError(projectId, userId);
  }

  // -------------------------------------------------------------- helpers

  private async requireProject(projectId: string): Promise<void> {
    const rows = await this.dataSource.query(`SELECT 1 FROM projects WHERE id = $1`, [projectId]);
    if (rows.length === 0) throw new ProjectNotFoundError(projectId);
  }

  private async requireRole(id: string, scope: RoleScope): Promise<Role> {
    const role = await this.roles.findOne({ where: { id } });
    if (!role) throw new RoleNotFoundError(id);
    if (role.scope !== scope) throw new RoleScopeMismatchError(`Role "${role.name}" has scope "${role.scope}", expected "${scope}"`);
    return role;
  }

  private assertGrantable(scope: RoleScope, permissions: CreateRoleDto['permissions']): void {
    if (scope === RoleScope.global) return;
    const bad = permissions.find((p) => !isGrantableToProjectRole(p.resource, p.action));
    if (bad) {
      throw new RoleScopeMismatchError(`${bad.resource}:${bad.action} can only be granted by a global role`);
    }
  }

  private async replacePermissions(
    repo: Repository<RolePermission>,
    roleId: string,
    permissions: CreateRoleDto['permissions'],
  ): Promise<void> {
    await repo.delete({ roleId });
    const unique = new Map(permissions.map((p) => [`${p.resource}:${p.action}`, p]));
    if (unique.size > 0) {
      await repo.insert([...unique.values()].map((p) => ({ roleId, resource: p.resource, action: p.action })));
    }
  }

  private memberRows(projectId: string, userId?: string): Promise<MemberResponseDto[]> {
    return this.dataSource
      .query(
        `SELECT pm.project_id AS "projectId", pm.user_id AS "userId", u.email AS "userEmail", u.name AS "userName",
                pm.role_id AS "roleId", r.name AS "roleName", pm.created_at AS "createdAt", pm.updated_at AS "updatedAt"
           FROM project_members pm
           JOIN users u ON u.id = pm.user_id
           JOIN roles r ON r.id = pm.role_id
          WHERE pm.project_id = $1 AND ($2::uuid IS NULL OR pm.user_id = $2)
          ORDER BY u.name, u.id`,
        [projectId, userId ?? null],
      )
      .then((rows: MemberResponseDto[]) => rows);
  }
}
