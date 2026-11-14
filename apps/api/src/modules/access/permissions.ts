/**
 * Everything a role can be granted on. The values are also the CASL subject types, so a permission
 * `parcel:update` becomes the rule `can('update', 'parcel', ...)`.
 */
export enum Resource {
  project = 'project',
  boundary = 'boundary',
  region = 'region',
  block = 'block',
  parcel = 'parcel',
  owner = 'owner',
  ownership = 'ownership',
  member = 'member',
  role = 'role',
  user = 'user',
}

export enum Action {
  create = 'create',
  read = 'read',
  update = 'update',
  delete = 'delete',
  /** Adds a user to a project. */
  invite = 'invite',
  /** CASL's wildcard: every action on the resource, including ones added later. */
  manage = 'manage',
}

export enum RoleScope {
  /** Predefined roles held once per user (`users.system_role_id`); their permissions apply to every project. */
  system = 'system',
  /** Held per project (`project_members`): predefined ones are shared, custom ones belong to exactly one project. */
  project = 'project',
}

export interface PermissionRef {
  readonly resource: Resource;
  readonly action: Action;
}

const RESOURCE_VALUES: ReadonlySet<string> = new Set(Object.values(Resource));
const ACTION_VALUES: ReadonlySet<string> = new Set(Object.values(Action));

export const isResource = (value: string): value is Resource =>
  RESOURCE_VALUES.has(value);
export const isAction = (value: string): value is Action =>
  ACTION_VALUES.has(value);

/** Rows that name an unknown resource or action are dropped: unknown permissions grant nothing. */
export function parsePermission(
  resource: string,
  action: string,
): PermissionRef | null {
  return isResource(resource) && isAction(action) ? { resource, action } : null;
}

export const permissionKey = ({ resource, action }: PermissionRef): string =>
  `${resource}:${action}`;

/** Seeded system roles (see the `AccessControlRework` migration). */
export const SystemRoleName = {
  superadmin: 'superadmin',
  auditor: 'system_auditor',
  /** Given to every account when its phone number is verified. */
  user: 'user',
} as const;

/** Seeded project roles. Custom roles are created per project and can never reuse these names. */
export const ProjectRoleName = {
  owner: 'owner',
  manager: 'manager',
  editor: 'editor',
  viewer: 'viewer',
} as const;
