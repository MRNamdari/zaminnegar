import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessPolicyService, projectAttributes } from '../abilities/access-policy.service';
import type { AuthenticatedRequest } from '../access.types';
import {
  AUTHENTICATED_ONLY_KEY,
  IS_PUBLIC_KEY,
  PERMISSION_KEY,
  type PermissionRequirement,
} from '../decorators/access.decorators';
import { InvalidProjectIdError } from '../errors/invalid-project-id.error';
import { NotAuthenticatedError } from '../errors/not-authenticated.error';
import { PermissionDeniedError } from '../errors/permission-denied.error';
import { ResourceNotFoundError } from '../errors/resource-not-found.error';
import { ResourceLocator, UUID_PATTERN } from '../services/resource-locator.service';

/**
 * Global guard, second of two: the coarse check at the HTTP edge. It resolves the project from the database, asks
 * the policy service, and fails closed: a route with no declared access rule is denied. Handlers re-check the same
 * rules in the application layer, so the HTTP guard is never the only line of defence.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly policy: AccessPolicyService,
    private readonly locator: ResourceLocator,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') return true;
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC_KEY, targets)) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { principal } = request;
    if (!principal) throw new NotAuthenticatedError();
    if (this.reflector.getAllAndOverride<boolean | undefined>(AUTHENTICATED_ONLY_KEY, targets)) return true;

    const requirement = this.reflector.get<PermissionRequirement | undefined>(PERMISSION_KEY, context.getHandler());
    if (!requirement) throw new PermissionDeniedError(); // fail closed: unannotated route

    const { resource, action, scope } = requirement;

    if (scope === 'system') {
      this.policy.assertSystem(principal, action, resource);
      return true;
    }

    if (scope === 'query') {
      const raw: unknown = request.query.projectId;
      if (raw === undefined) {
        request.projectScope = this.policy.accessibleProjectIds(principal, action, resource);
        return true;
      }
      const projectId = this.requireUuid(raw);
      this.policy.assertCan(principal, action, resource, projectAttributes(resource, projectId));
      request.projectScope = [projectId]; // narrowed to the one project that was just authorized
      return true;
    }

    const projectId =
      scope === 'body'
        ? this.requireUuid((request.body as { projectId?: unknown } | undefined)?.projectId)
        : await this.resolveFromParam(request, requirement);

    // A record in a project the caller has nothing to do with answers exactly like a record that does not exist.
    if (scope === 'param' && !this.policy.isRelatedTo(principal, projectId)) throw new ResourceNotFoundError();

    this.policy.assertCan(principal, action, resource, projectAttributes(resource, projectId));
    return true;
  }

  /** Record not found and "not yours" are indistinguishable: both are a 404, so ids cannot be probed. */
  private async resolveFromParam(request: AuthenticatedRequest, { param, idOf }: PermissionRequirement): Promise<string> {
    const id = request.params[param];
    const projectId = typeof id === 'string' ? await this.locator.projectIdOf(idOf, id) : null;
    if (!projectId) throw new ResourceNotFoundError();
    return projectId;
  }

  private requireUuid(value: unknown): string {
    if (typeof value !== 'string' || !UUID_PATTERN.test(value)) throw new InvalidProjectIdError();
    return value;
  }
}
