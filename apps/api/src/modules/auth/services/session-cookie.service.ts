import { Inject, Injectable } from '@nestjs/common';
import type { CookieSerializeOptions } from '@fastify/cookie';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AUTH_CONFIG, type AuthConfig } from '../auth.config';
import { SESSION_TOKEN_PATTERN } from '../utils/token';

/** The only place that reads or writes the session cookie. */
@Injectable()
export class SessionCookieService {
  constructor(@Inject(AUTH_CONFIG) private readonly config: AuthConfig) {}

  /**
   * Returns the well-formed session identifier from the `Cookie` header, else null. Parsed by hand because only one
   * cookie matters; anything that is not exactly 43 base64url characters is rejected before it reaches the database.
   */
  read(request: Pick<FastifyRequest, 'headers'>): string | null {
    const header = request.headers.cookie;
    if (!header) return null;
    for (const part of header.split(';')) {
      const separator = part.indexOf('=');
      if (
        separator < 0 ||
        part.slice(0, separator).trim() !== this.config.session.cookieName
      )
        continue;
      const value = part.slice(separator + 1).trim();
      return SESSION_TOKEN_PATTERN.test(value) ? value : null;
    }
    return null;
  }

  /**
   * `maxAgeMs` is in milliseconds, but `Max-Age` is in seconds and `@fastify/cookie` passes `maxAge` through as is
   * (Express divided by 1000 itself). Express also sent `Expires`, so it is kept: the cookie looks the same on the wire.
   */
  write(reply: FastifyReply, token: string, maxAgeMs: number): void {
    const lifetimeMs = Math.max(0, Math.floor(maxAgeMs));
    reply.setCookie(this.config.session.cookieName, token, {
      ...this.baseOptions(),
      maxAge: Math.floor(lifetimeMs / 1000),
      expires: new Date(Date.now() + lifetimeMs),
    });
  }

  /** Same attributes as `write` (path, secure, sameSite, httpOnly; no domain), or the browser keeps the old cookie. */
  clear(reply: FastifyReply): void {
    reply.clearCookie(this.config.session.cookieName, this.baseOptions());
  }

  private baseOptions(): CookieSerializeOptions & {
    httpOnly: true;
    secure: boolean;
    sameSite: 'lax' | 'strict' | 'none';
    path: '/';
  } {
    const { cookieSecure, cookieSameSite } = this.config.session;
    // No `domain`: the cookie stays host-only, as the `__Host-` prefix requires.
    return {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: cookieSameSite,
      path: '/',
    };
  }
}
