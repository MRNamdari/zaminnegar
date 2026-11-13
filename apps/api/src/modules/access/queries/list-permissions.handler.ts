import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Permission } from '../entities/permission.entity';
import { PermissionRepository } from '../repositories/permission.repository';
import { ListPermissionsQuery } from './list-permissions.query';

/** The global permission catalogue. Public to any signed-in user: it describes the system, not anyone's data. */
@QueryHandler(ListPermissionsQuery)
export class ListPermissionsHandler implements IQueryHandler<ListPermissionsQuery, Permission[]> {
  constructor(private readonly permissions: PermissionRepository) {}

  execute(): Promise<Permission[]> {
    return this.permissions.findAll();
  }
}
