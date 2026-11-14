import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Response } from 'express';
import { ACCESS_CONFIG, type AccessConfig } from '../access.config';
import type { AuthenticatedRequest } from '../access.types';
import { IS_PUBLIC_KEY } from '../decorators/access.decorators';
import { NotAuthenticatedError } from '../errors/not-authenticated.error';
import { OriginNotAllowedError } from '../errors/origin-not-allowed.error';
import { SessionCookieService } from '../services/session-cookie.service';
import { SessionService } from '../services/session.service';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Global guard, first of two. Turns the session cookie into `request.principal`, or rejects the request.
 * Also the CSRF backstop for cookie sessions (beside SameSite): a state-changing request that names an Origin must
 * name a trusted one.
 */
@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly sessions: SessionService,
    private readonly cookies: SessionCookieService,
    @Inject(ACCESS_CONFIG) private readonly config: AccessConfig,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') return true;
    const http = context.switchToHttp();
    const request = http.getRequest<AuthenticatedRequest>();
    const response = http.getResponse<Response>();

    this.assertTrustedOrigin(request);

    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;

    const token = this.cookies.read(request);
    if (!token) throw new NotAuthenticatedError();

    const session = await this.sessions.authenticate(token);
    if (!session) {
      this.cookies.clear(response); // a dead cookie is of no use to the browser
      throw new NotAuthenticatedError();
    }
    request.principal = session.principal;
    if (session.rotation) this.cookies.write(response, session.rotation.token, session.rotation.cookieMaxAgeMs);
    return true;
  }

  private assertTrustedOrigin(request: AuthenticatedRequest): void {
    const { trustedOrigins } = this.config.session;
    if (trustedOrigins.length === 0 || SAFE_METHODS.has(request.method)) return;
    const origin = request.headers.origin;
    if (origin !== undefined && !trustedOrigins.includes(origin)) throw new OriginNotAllowedError();
  }
}
