import { GetProjectRoleHandler } from './get-project-role.handler';
import { GetUserHandler } from './get-user.handler';
import { ListPermissionsHandler } from './list-permissions.handler';
import { ListProjectMembersHandler } from './list-project-members.handler';
import { ListProjectRolesHandler } from './list-project-roles.handler';
import { ListSystemRolesHandler } from './list-system-roles.handler';
import { ListUsersHandler } from './list-users.handler';

export const AccessQueryHandlers = [
  ListPermissionsHandler,
  ListUsersHandler,
  GetUserHandler,
  ListSystemRolesHandler,
  ListProjectRolesHandler,
  GetProjectRoleHandler,
  ListProjectMembersHandler,
];
