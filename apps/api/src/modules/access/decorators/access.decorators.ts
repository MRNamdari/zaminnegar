import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { AuthContext, AuthedRequest } from '../access.types';
import { Action, Resource } from '../permissions';

export const IS_PUBLIC_KEY = 'access:public';
export const AUTHENTICATED_ONLY_KEY = 'access:authenticated-only';
export const PERMISSION_KEY = 'access:permission';

/** Where the project a request acts on comes from. */
export type PermissionScope =
  | 'param' // the project owning the resource whose id is in the route (see `idOf` / `param`)
  | 'body' // `body.projectId`
  | 'query' // `query.projectId`, or, when absent, every project the caller may read (list routes)
  | 'global'; // no project: only a global role can pass

export interface PermissionOptions {
  /** Defaults to `'param'`. */
  scope?: PermissionScope;
  /** `'param'` scope: the resource type that the route id identifies, when it differs from `resource`. */
  idOf?: Resource;
  /** `'param'` scope: name of the route parameter holding that id. Defaults to `'id'`. */
  param?: string;
}

export interface PermissionMeta extends Omit<PermissionOptions, 'scope'> {
  resource: Resource;
  action: Action;
  scope: PermissionScope;
}

/** Skips authentication entirely (login). */
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);

/** Any authenticated user may call the route; no permission is checked (profile, role catalogue). */
export const AuthenticatedOnly = (): MethodDecorator & ClassDecorator => SetMetadata(AUTHENTICATED_ONLY_KEY, true);

/**
 * Requires `resource:action`. Routes with none of `@Public`, `@AuthenticatedOnly` or `@RequirePermission` are
 * rejected, so a forgotten annotation can never expose an endpoint.
 */
export const RequirePermission = (
  resource: Resource,
  action: Action,
  options: PermissionOptions = {},
): MethodDecorator & ClassDecorator =>
  SetMetadata(PERMISSION_KEY, { resource, action, ...options, scope: options.scope ?? 'param' } satisfies PermissionMeta);

/** The authenticated caller. */
export const Auth = createParamDecorator((_: unknown, context: ExecutionContext): AuthContext => {
  const request = context.switchToHttp().getRequest<AuthedRequest>();
  return request.auth as AuthContext;
});

/** On list routes: the projects the caller may read (null = all), to pass to the query handler. */
export const ProjectScope = createParamDecorator((_: unknown, context: ExecutionContext): string[] | null => {
  const request = context.switchToHttp().getRequest<AuthedRequest>();
  return request.projectScope ?? null;
});
