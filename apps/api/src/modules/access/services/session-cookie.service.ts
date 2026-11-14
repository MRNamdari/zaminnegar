import { Inject, Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ACCESS_CONFIG, type AccessConfig } from '../access.config';
import { SESSION_TOKEN_PATTERN } from '../utils/token';

/** The only place that reads or writes the session cookie. */
@Injectable()
export class SessionCookieService {
  constructor(@Inject(ACCESS_CONFIG) private readonly config: AccessConfig) {}

  /**
   * Returns the well-formed session identifier from the `Cookie` header, else null. Parsed by hand because only one
   * cookie matters; anything that is not exactly 43 base64url characters is rejected before it reaches the database.
   */
  read(request: Request): string | null {
    const header = request.headers.cookie;
    if (!header) return null;
    for (const part of header.split(';')) {
      const separator = part.indexOf('=');
      if (separator < 0 || part.slice(0, separator).trim() !== this.config.session.cookieName) continue;
      const value = part.slice(separator + 1).trim();
      return SESSION_TOKEN_PATTERN.test(value) ? value : null;
    }
    return null;
  }

  write(response: Response, token: string, maxAgeMs: number): void {
    response.cookie(this.config.session.cookieName, token, { ...this.baseOptions(), maxAge: Math.max(0, Math.floor(maxAgeMs)) });
  }

  clear(response: Response): void {
    response.clearCookie(this.config.session.cookieName, this.baseOptions());
  }

  private baseOptions(): { httpOnly: true; secure: boolean; sameSite: 'lax' | 'strict' | 'none'; path: '/' } {
    const { cookieSecure, cookieSameSite } = this.config.session;
    // No `domain`: the cookie stays host-only, as the `__Host-` prefix requires.
    return { httpOnly: true, secure: cookieSecure, sameSite: cookieSameSite, path: '/' };
  }
}
