import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthedRequest } from '../access.types';
import { IS_PUBLIC_KEY } from '../decorators/access.decorators';
import { SessionService } from '../services/session.service';

/** Authentication: `Authorization: Bearer <session token>` -> `request.auth`. Global; opt out with `@Public()`. */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly sessions: SessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])) {
      return true;
    }
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const [scheme, token] = (request.headers.authorization ?? '').split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) throw new UnauthorizedException('Missing bearer token');

    const auth = await this.sessions.authenticate(token);
    if (!auth) throw new UnauthorizedException('Invalid or expired session');
    request.auth = auth;
    return true;
  }
}
