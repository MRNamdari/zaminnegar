/** Everything a role can be granted on. `user` and `role` are administered globally, never per project. */
export enum Resource {
  project = 'project',
  boundary = 'boundary',
  region = 'region',
  block = 'block',
  parcel = 'parcel',
  owner = 'owner',
  ownership = 'ownership',
  member = 'member',
  user = 'user',
  role = 'role',
}

export enum Action {
  create = 'create',
  read = 'read',
  update = 'update',
  delete = 'delete',
}

export enum RoleScope {
  /** Granted once to a user (`users.global_role_id`); applies to every project. */
  global = 'global',
  /** Granted to a user inside one project (`project_members`). */
  project = 'project',
}

/** Resources (and `project:create`) that only a global role can hold. */
export const GLOBAL_ONLY_RESOURCES: readonly Resource[] = [
  Resource.user,
  Resource.role,
];

export const permissionKey = (resource: Resource, action: Action): string =>
  `${resource}:${action}`;

export function isGrantableToProjectRole(
  resource: Resource,
  action: Action,
): boolean {
  if (GLOBAL_ONLY_RESOURCES.includes(resource)) return false;
  return !(resource === Resource.project && action === Action.create);
}
