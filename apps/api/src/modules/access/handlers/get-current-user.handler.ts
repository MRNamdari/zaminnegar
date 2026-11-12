import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CurrentUserResponseDto } from '../dto/user.dto';
import { GetCurrentUserQuery } from '../queries/get-current-user.query';

const toPermissions = (keys: Iterable<string>): CurrentUserResponseDto['globalPermissions'] =>
  [...keys].sort().map((key) => {
    const [resource, action] = key.split(':');
    return { resource, action };
  }) as CurrentUserResponseDto['globalPermissions'];

@QueryHandler(GetCurrentUserQuery)
export class GetCurrentUserHandler implements IQueryHandler<GetCurrentUserQuery, CurrentUserResponseDto> {
  execute({ auth }: GetCurrentUserQuery): Promise<CurrentUserResponseDto> {
    return Promise.resolve({
      ...auth.user,
      globalRole: auth.globalRole,
      globalPermissions: toPermissions(auth.globalPermissions),
      memberships: [...auth.memberships].map(([projectId, role]) => ({
        projectId,
        role: { id: role.roleId, name: role.roleName },
        permissions: toPermissions(auth.projectPermissions.get(projectId) ?? []),
      })),
    });
  }
}
