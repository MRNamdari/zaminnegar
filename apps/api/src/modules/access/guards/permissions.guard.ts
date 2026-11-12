import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthedRequest } from '../access.types';
import {
  AUTHENTICATED_ONLY_KEY,
  IS_PUBLIC_KEY,
  PERMISSION_KEY,
  PermissionMeta,
} from '../decorators/access.decorators';
import {
  AuthorizationService,
  isUuid,
} from '../services/authorization.service';

/**
 * Authorization (RBAC with data-level scoping). Roles and their permissions come from the database; the
 * *project* a request touches decides which of the caller's roles applies:
 *  - a global role (e.g. admin) applies to every project;
 *  - a project membership applies to that one project only.
 * Default-deny: a route with no `@Public`, `@AuthenticatedOnly` or `@RequirePermission` is rejected.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authorization: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets))
      return true;
    if (
      this.reflector.getAllAndOverride<boolean>(AUTHENTICATED_ONLY_KEY, targets)
    )
      return true;

    const meta = this.reflector.getAllAndOverride<PermissionMeta | undefined>(
      PERMISSION_KEY,
      targets,
    );
    if (!meta) throw new ForbiddenException('This route has no access rule');

    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const auth = request.auth;
    if (!auth) throw new ForbiddenException();
    const { resource, action } = meta;

    switch (meta.scope) {
      case 'global':
        return this.require(
          this.authorization.can(auth, resource, action, null),
        );

      case 'body': {
        const projectId = (request.body as { projectId?: unknown } | undefined)
          ?.projectId;
        if (!isUuid(projectId))
          throw new BadRequestException('projectId must be a UUID');
        return this.require(
          this.authorization.can(auth, resource, action, projectId),
        );
      }

      case 'query': {
        const projectId = (request.query as { projectId?: unknown }).projectId;
        if (projectId !== undefined) {
          if (!isUuid(projectId))
            throw new BadRequestException('projectId must be a UUID');
          request.projectScope = null; // already authorized for exactly this project
          return this.require(
            this.authorization.can(auth, resource, action, projectId),
          );
        }
        // No project given: the list is restricted to the projects the caller may read.
        request.projectScope = this.authorization.readableProjectIds(
          auth,
          resource,
          action,
        );
        return true;
      }

      case 'param': {
        const id = request.params[meta.param ?? 'id'];
        const projectId = await this.authorization.projectIdOf(
          meta.idOf ?? resource,
          id,
        );
        // Unknown id: let the handler answer 404, but only for callers who could use the route at all.
        if (projectId === null)
          return this.require(
            this.authorization.canAnywhere(auth, resource, action),
          );
        return this.require(
          this.authorization.can(auth, resource, action, projectId),
        );
      }
    }
  }

  private require(allowed: boolean): true {
    if (!allowed)
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    return true;
  }
}
