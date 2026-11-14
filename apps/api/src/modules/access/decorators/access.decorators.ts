import { applyDecorators, createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { ApiCookieAuth } from '@nestjs/swagger';
import type { AuthenticatedRequest, Principal } from '../access.types';
import { NoActiveProjectError } from '../errors/no-active-project.error';
import { NotAuthenticatedError } from '../errors/not-authenticated.error';
import { Action, Resource } from '../permissions';

export const IS_PUBLIC_KEY = 'access:public';
export const AUTHENTICATED_ONLY_KEY = 'access:authenticated-only';
export const PERMISSION_KEY = 'access:permission';

/** OpenAPI security scheme name for the session cookie. */
export const SESSION_AUTH_NAME = 'session';

/** Marks the operation as protected by the session cookie in the OpenAPI document. */
export const ApiSessionAuth = (): ClassDecorator & MethodDecorator => ApiCookieAuth(SESSION_AUTH_NAME);

/** No authentication at all. Everything is private unless it says so. */
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Requires a session but no permission, for routes whose authorization depends on the record and is decided in the
 * application service (for example "read my own account", "leave a project").
 */
export const AuthenticatedOnly = (): MethodDecorator & ClassDecorator => applyDecorators(SetMetadata(AUTHENTICATED_ONLY_KEY, true));

/**
 * How the guard finds the project the permission is checked against:
 *  - `param` (default): `idOf` (default: the permission's resource) record whose id is in route param `param` (default `id`)
 *  - `body`: `projectId` in the request body
 *  - `query`: optional `projectId` in the query string; without it `@ProjectScope()` carries the accessible projects
 *  - `active`: the session's active project (`PUT /auth/session/project`); 409 `NO_ACTIVE_PROJECT` when none is set
 *  - `system`: no project; the permission must be held at system level
 */
export type PermissionScope = 'param' | 'body' | 'query' | 'active' | 'system';

export interface PermissionOptions {
  scope?: PermissionScope;
  param?: string;
  idOf?: Resource;
}

export interface PermissionRequirement {
  resource: Resource;
  action: Action;
  scope: PermissionScope;
  param: string;
  idOf: Resource;
}

export const RequirePermission = (resource: Resource, action: Action, options: PermissionOptions = {}): MethodDecorator =>
  SetMetadata<string, PermissionRequirement>(PERMISSION_KEY, {
    resource,
    action,
    scope: options.scope ?? 'param',
    param: options.param ?? 'id',
    idOf: options.idOf ?? resource,
  });

/** The authenticated caller. Only available on routes that are not `@Public()`. */
export const CurrentPrincipal = createParamDecorator((_data: unknown, context: ExecutionContext): Principal => {
  const { principal } = context.switchToHttp().getRequest<AuthenticatedRequest>();
  if (!principal) throw new NotAuthenticatedError();
  return principal;
});

/** The session's active project, for routes declared with `scope: 'active'`. */
export const ActiveProjectId = createParamDecorator((_data: unknown, context: ExecutionContext): string => {
  const { principal } = context.switchToHttp().getRequest<AuthenticatedRequest>();
  if (!principal) throw new NotAuthenticatedError();
  if (!principal.activeProjectId) throw new NoActiveProjectError();
  return principal.activeProjectId;
});

/** Projects the caller may access on a `scope: 'query'` route; `null` = all, `[]` = none. */
export const ProjectScope = createParamDecorator((_data: unknown, context: ExecutionContext): string[] | null => {
  const { projectScope } = context.switchToHttp().getRequest<AuthenticatedRequest>();
  return projectScope === undefined ? [] : projectScope;
});
