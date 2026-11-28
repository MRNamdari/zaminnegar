import 'reflect-metadata';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import fastifyCookie from '@fastify/cookie';
import Fastify, { type FastifyInstance } from 'fastify';
import type { AuthConfig } from '../auth.config';
import { SessionCookieService } from './session-cookie.service';

const TOKEN = 'A'.repeat(43);
const ONE_HOUR_MS = 3_600_000;

function config(overrides: Partial<AuthConfig['session']> = {}): AuthConfig {
  return {
    session: {
      cookieName: '__Host-sid',
      cookieSecure: true,
      cookieSameSite: 'lax',
      idleTtlSeconds: 3600,
      absoluteTtlSeconds: 86_400,
      touchIntervalSeconds: 60,
      rotationIntervalSeconds: 900,
      rotationGraceSeconds: 30,
      trustedOrigins: [],
      ...overrides,
    },
    password: { memoryCostKib: 19_456, timeCost: 2, parallelism: 1 },
    otp: {
      ttlSeconds: 120,
      resendCooldownSeconds: 60,
      maxAttempts: 5,
      maxPerSubjectPerHour: 5,
      maxPerIpPerHour: 30,
      hmacSecret: 'x'.repeat(32),
    },
    login: { maxFailedAttempts: 5, lockoutSeconds: 900 },
    sms: { driver: 'console', allowConsoleInProduction: false },
  };
}

describe('SessionCookieService (Fastify)', () => {
  const service = new SessionCookieService(config());
  let app: FastifyInstance;

  before(async () => {
    app = Fastify();
    await app.register(fastifyCookie);
    app.get('/write', (_request, reply) => {
      service.write(reply, TOKEN, ONE_HOUR_MS);
      return reply.send('ok');
    });
    app.get('/write-negative', (_request, reply) => {
      service.write(reply, TOKEN, -5000);
      return reply.send('ok');
    });
    app.get('/clear', (_request, reply) => {
      service.clear(reply);
      return reply.send('ok');
    });
    await app.ready();
  });

  after(async () => {
    await app.close();
  });

  async function setCookie(url: string): Promise<string> {
    const response = await app.inject({ method: 'GET', url });
    const header = response.headers['set-cookie'];
    assert.ok(typeof header === 'string', 'exactly one Set-Cookie header');
    return header;
  }

  it('turns the millisecond lifetime into Max-Age seconds (no 1000x error)', async () => {
    assert.match(await setCookie('/write'), /; Max-Age=3600(;|$)/);
  });

  it('keeps Expires, host-only scope and the security attributes', async () => {
    const header = await setCookie('/write');
    assert.ok(header.startsWith(`__Host-sid=${TOKEN};`));
    assert.match(header, /; Path=\/(;|$)/);
    assert.match(header, /; HttpOnly(;|$)/);
    assert.match(header, /; Secure(;|$)/);
    assert.match(header, /; SameSite=Lax(;|$)/);
    assert.match(header, /; Expires=/);
    assert.doesNotMatch(header, /Domain=/i);
  });

  it('never writes a negative lifetime', async () => {
    assert.match(await setCookie('/write-negative'), /; Max-Age=0(;|$)/);
  });

  it('clears with the same attributes the cookie was written with', async () => {
    const header = await setCookie('/clear');
    assert.ok(header.startsWith('__Host-sid=;'));
    assert.match(header, /; Max-Age=0(;|$)/);
    assert.match(header, /; Expires=Thu, 01 Jan 1970 00:00:00 GMT/);
    assert.match(header, /; Path=\/(;|$)/);
    assert.match(header, /; HttpOnly(;|$)/);
    assert.match(header, /; Secure(;|$)/);
    assert.match(header, /; SameSite=Lax(;|$)/);
    assert.doesNotMatch(header, /Domain=/i);
  });

  it('reads only a well-formed session cookie', () => {
    const read = (cookie?: string): string | null =>
      service.read({ headers: cookie === undefined ? {} : { cookie } });
    assert.equal(read(`a=b; __Host-sid=${TOKEN}; c=d`), TOKEN);
    assert.equal(read(), null);
    assert.equal(read('other=1'), null);
    assert.equal(read('__Host-sid=short'), null);
    assert.equal(read(`__Host-sid=${TOKEN}x`), null);
  });
});
