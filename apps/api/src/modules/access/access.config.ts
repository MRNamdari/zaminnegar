import { ConfigService } from '@nestjs/config';

export const ACCESS_CONFIG = Symbol('ACCESS_CONFIG');

export type SameSiteMode = 'lax' | 'strict' | 'none';
export type SmsDriver = 'console' | 'simorgh';

export interface AccessConfig {
  readonly session: {
    readonly cookieName: string;
    readonly cookieSecure: boolean;
    readonly cookieSameSite: SameSiteMode;
    /** A session ends after this long without a request. */
    readonly idleTtlSeconds: number;
    /** A session ends this long after login, however active it is. */
    readonly absoluteTtlSeconds: number;
    /** `last_used_at` / the idle deadline are written at most this often. */
    readonly touchIntervalSeconds: number;
    /** The session identifier is replaced when it is older than this. */
    readonly rotationIntervalSeconds: number;
    /** After a rotation the previous identifier keeps working this long, for requests already in flight. */
    readonly rotationGraceSeconds: number;
    /** Origins allowed to send state-changing requests. Empty = no Origin check (SameSite still applies). */
    readonly trustedOrigins: readonly string[];
  };
  readonly password: {
    readonly memoryCostKib: number;
    readonly timeCost: number;
    readonly parallelism: number;
  };
  readonly otp: {
    readonly ttlSeconds: number;
    readonly resendCooldownSeconds: number;
    /** Wrong guesses allowed per code. */
    readonly maxAttempts: number;
    readonly maxPerSubjectPerHour: number;
    readonly maxPerIpPerHour: number;
    /** Keys the code hash: a six-digit code is trivially brute-forced from a plain hash. */
    readonly hmacSecret: string;
  };
  readonly login: {
    readonly maxFailedAttempts: number;
    readonly lockoutSeconds: number;
  };
  readonly sms: {
    readonly driver: SmsDriver;
    readonly allowConsoleInProduction: boolean;
  };
}

function integer(config: ConfigService, key: string, fallback: number): number {
  const raw = config.get<string | number>(key);
  const value = raw === undefined || raw === '' ? fallback : Number(raw);
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${key} must be a positive integer`);
  return value;
}

function flag(config: ConfigService, key: string, fallback: boolean): boolean {
  const raw = config.get<string | boolean>(key);
  if (raw === undefined || raw === '') return fallback;
  if (raw === true || raw === 'true') return true;
  if (raw === false || raw === 'false') return false;
  throw new Error(`${key} must be "true" or "false"`);
}

function oneOf<T extends string>(config: ConfigService, key: string, allowed: readonly T[], fallback: T): T {
  const raw = config.get<string>(key);
  if (raw === undefined || raw === '') return fallback;
  const match = allowed.find((candidate) => candidate === raw.toLowerCase());
  if (!match) throw new Error(`${key} must be one of: ${allowed.join(', ')}`);
  return match;
}

/** Reads and validates every access setting once, at start-up. A bad value stops the application. */
export function loadAccessConfig(config: ConfigService): AccessConfig {
  const production = config.get<string>('NODE_ENV') === 'production';

  const cookieSecure = flag(config, 'SESSION_COOKIE_SECURE', production);
  const cookieSameSite = oneOf<SameSiteMode>(config, 'SESSION_COOKIE_SAME_SITE', ['lax', 'strict', 'none'], 'lax');
  // `__Host-` makes browsers refuse the cookie unless it is Secure, host-only and Path=/, which is what we set.
  const cookieName = config.get<string>('SESSION_COOKIE_NAME') || (cookieSecure ? '__Host-sid' : 'sid');
  if (cookieSameSite === 'none' && !cookieSecure) throw new Error('SESSION_COOKIE_SAME_SITE=none requires SESSION_COOKIE_SECURE=true');
  if (cookieName.startsWith('__Host-') && !cookieSecure) throw new Error('A __Host- cookie name requires SESSION_COOKIE_SECURE=true');
  if (!/^[A-Za-z0-9_-]+$/.test(cookieName)) throw new Error('SESSION_COOKIE_NAME may only contain letters, digits, "_" and "-"');

  const idleTtlSeconds = integer(config, 'SESSION_IDLE_TTL_SECONDS', 3600);
  const absoluteTtlSeconds = integer(config, 'SESSION_ABSOLUTE_TTL_SECONDS', 86_400);
  const touchIntervalSeconds = integer(config, 'SESSION_TOUCH_INTERVAL_SECONDS', 60);
  if (idleTtlSeconds > absoluteTtlSeconds) throw new Error('SESSION_IDLE_TTL_SECONDS must not exceed SESSION_ABSOLUTE_TTL_SECONDS');
  if (touchIntervalSeconds >= idleTtlSeconds) throw new Error('SESSION_TOUCH_INTERVAL_SECONDS must be smaller than SESSION_IDLE_TTL_SECONDS');

  const trustedOrigins = (config.get<string>('TRUSTED_ORIGINS') ?? '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter((origin) => origin.length > 0);

  const hmacSecret = config.getOrThrow<string>('OTP_HMAC_SECRET');
  if (hmacSecret.length < 32) throw new Error('OTP_HMAC_SECRET must be at least 32 characters');

  return {
    session: {
      cookieName,
      cookieSecure,
      cookieSameSite,
      idleTtlSeconds,
      absoluteTtlSeconds,
      touchIntervalSeconds,
      rotationIntervalSeconds: integer(config, 'SESSION_ROTATION_INTERVAL_SECONDS', 900),
      rotationGraceSeconds: integer(config, 'SESSION_ROTATION_GRACE_SECONDS', 30),
      trustedOrigins,
    },
    // OWASP's minimum recommended Argon2id profile: 19 MiB, 2 iterations, 1 lane.
    password: {
      memoryCostKib: integer(config, 'ARGON2_MEMORY_KIB', 19_456),
      timeCost: integer(config, 'ARGON2_TIME_COST', 2),
      parallelism: integer(config, 'ARGON2_PARALLELISM', 1),
    },
    otp: {
      ttlSeconds: integer(config, 'OTP_TTL_SECONDS', 120),
      resendCooldownSeconds: integer(config, 'OTP_RESEND_COOLDOWN_SECONDS', 60),
      maxAttempts: integer(config, 'OTP_MAX_ATTEMPTS', 5),
      maxPerSubjectPerHour: integer(config, 'OTP_MAX_PER_PHONE_PER_HOUR', 5),
      maxPerIpPerHour: integer(config, 'OTP_MAX_PER_IP_PER_HOUR', 30),
      hmacSecret,
    },
    login: {
      maxFailedAttempts: integer(config, 'LOGIN_MAX_FAILED_ATTEMPTS', 5),
      lockoutSeconds: integer(config, 'LOGIN_LOCKOUT_SECONDS', 900),
    },
    sms: {
      driver: oneOf<SmsDriver>(config, 'SMS_DRIVER', ['console', 'simorgh'], 'console'),
      allowConsoleInProduction: flag(config, 'SMS_ALLOW_CONSOLE_IN_PRODUCTION', false),
    },
  };
}

export const OTP_LENGTH = 6;
