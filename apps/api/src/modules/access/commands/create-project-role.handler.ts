import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { AccessPolicyService, projectAttributes } from '../abilities/access-policy.service';
import type { Role } from '../entities/role.entity';
import { RoleNameTakenError } from '../errors/role-name-taken.error';
import { Action, Resource, RoleScope } from '../permissions';
import { ProjectMemberRepository } from '../repositories/project-member.repository';
import { RoleRepository } from '../repositories/role.repository';
import { RolePermissionService } from '../services/role-permission.service';
import { ProjectNotFoundError } from '../../project/errors/project-not-found.error';
import { CreateProjectRoleCommand } from './create-project-role.command';

@CommandHandler(CreateProjectRoleCommand)
export class CreateProjectRoleHandler implements ICommandHandler<CreateProjectRoleCommand, Role> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly policy: AccessPolicyService,
    private readonly roles: RoleRepository,
    private readonly members: ProjectMemberRepository,
    private readonly rolePermissions: RolePermissionService,
  ) {}

  async execute({ actor, projectId, dto }: CreateProjectRoleCommand): Promise<Role> {
    this.policy.assertCan(actor, Action.create, Resource.role, projectAttributes(Resource.role, projectId));

    return this.dataSource.transaction(async (manager) => {
      if (!(await this.members.lockProject(projectId, manager))) throw new ProjectNotFoundError(projectId);

      const permissions = await this.rolePermissions.resolveForProjectRole(manager, dto.permissions);
      this.policy.assertCanGrant(actor, projectId, permissions); // nobody can create a role stronger than themselves
      if (await this.roles.nameTakenInProject(projectId, dto.name, null, manager)) throw new RoleNameTakenError(dto.name);

      const role = await this.roles.save(
        this.roles.build({ name: dto.name, description: dto.description ?? '', scope: RoleScope.project, isSystem: false, projectId }),
        manager,
      );
      await this.roles.replacePermissions(role.id, permissions, manager);
      const created = await this.roles.findWithPermissions(role.id, manager);
      if (!created) throw new Error('Role was not stored');
      return created;
    });
  }
}
