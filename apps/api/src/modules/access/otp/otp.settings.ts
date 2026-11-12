import { ConfigService } from '@nestjs/config';

export const OTP_LENGTH = 6;
export const OTP_SETTINGS = Symbol('OTP_SETTINGS');

export interface OtpSettings {
  readonly ttlSeconds: number;
  readonly resendCooldownSeconds: number;
  /** Wrong guesses allowed per code. */
  readonly maxAttempts: number;
  readonly maxPerPhonePerHour: number;
  readonly maxPerIpPerHour: number;
  /** Keys the code hash: a 6-digit code is trivially brute-forced from a plain hash. */
  readonly hmacSecret: string;
}

function positiveInt(config: ConfigService, key: string, fallback: number): number {
  const value = Number(config.get(key) ?? fallback);
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${key} must be a positive integer`);
  return value;
}

export function otpSettingsFactory(config: ConfigService): OtpSettings {
  const hmacSecret = config.getOrThrow<string>('OTP_HMAC_SECRET');
  if (hmacSecret.length < 32) throw new Error('OTP_HMAC_SECRET must be at least 32 characters');
  return {
    ttlSeconds: positiveInt(config, 'OTP_TTL_SECONDS', 120),
    resendCooldownSeconds: positiveInt(config, 'OTP_RESEND_COOLDOWN_SECONDS', 60),
    maxAttempts: positiveInt(config, 'OTP_MAX_ATTEMPTS', 5),
    maxPerPhonePerHour: positiveInt(config, 'OTP_MAX_PER_PHONE_PER_HOUR', 5),
    maxPerIpPerHour: positiveInt(config, 'OTP_MAX_PER_IP_PER_HOUR', 30),
    hmacSecret,
  };
}
