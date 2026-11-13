import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { BaseRepository } from '../../../common/base/base.repository';
import type { PermissionRef } from '../permissions';
import { RoleScope } from '../permissions';
import { RolePermission } from '../entities/role-permission.entity';
import { Role } from '../entities/role.entity';

export type LockMode = 'pessimistic_read' | 'pessimistic_write';

@Injectable()
export class RoleRepository extends BaseRepository<Role> {
  constructor(@InjectRepository(Role) repository: Repository<Role>) {
    super(repository);
  }

  findWithPermissions(id: string, manager?: EntityManager): Promise<Role | null> {
    return this.repo(manager).findOne({ where: { id }, relations: { permissions: true } });
  }

  /** Locks the role row (needs a transaction) so assignment and deletion of the same role serialize. */
  lockById(id: string, mode: LockMode, manager: EntityManager): Promise<Role | null> {
    return manager.getRepository(Role).findOne({ where: { id }, lock: { mode } });
  }

  findPredefined(name: string, scope: RoleScope, manager?: EntityManager): Promise<Role | null> {
    return this.repo(manager).findOne({ where: { name, scope, projectId: IsNull(), isSystem: true } });
  }

  listPredefined(scope: RoleScope): Promise<Role[]> {
    return this.repository.find({
      where: { scope, projectId: IsNull(), isSystem: true },
      relations: { permissions: true },
      order: { name: 'ASC' },
    });
  }

  /** The roles a project can assign: the shared predefined project roles plus its own custom roles. */
  listForProject(projectId: string): Promise<Role[]> {
    return this.repository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .where('role.scope = :scope', { scope: RoleScope.project })
      .andWhere('(role.projectId IS NULL OR role.projectId = :projectId)', { projectId })
      .orderBy('role.isSystem', 'DESC')
      .addOrderBy('role.name', 'ASC')
      .getMany();
  }

  /** True when a predefined project role or one of this project's roles already uses the name (case-insensitive). */
  async nameTakenInProject(projectId: string, name: string, exceptRoleId: string | null, manager: EntityManager): Promise<boolean> {
    const qb = manager
      .getRepository(Role)
      .createQueryBuilder('role')
      .where('role.scope = :scope', { scope: RoleScope.project })
      .andWhere('(role.projectId IS NULL OR role.projectId = :projectId)', { projectId })
      .andWhere('lower(role.name) = lower(:name)', { name });
    if (exceptRoleId) qb.andWhere('role.id <> :exceptRoleId', { exceptRoleId });
    return (await qb.getCount()) > 0;
  }

  async replacePermissions(roleId: string, permissions: readonly PermissionRef[], manager: EntityManager): Promise<void> {
    const repo = manager.getRepository(RolePermission);
    await repo.delete({ roleId });
    if (permissions.length > 0) {
      await repo.insert(permissions.map(({ resource, action }) => ({ roleId, resource, action })));
    }
  }
}
