import type { E164Phone } from '../access.types';

/** Port for delivering OTP codes by SMS. Injected by class token; the provider adapter is swappable. */
export abstract class SmsGateway {
  /** Resolves once the provider accepted the message; rejects with `SmsDeliveryError` otherwise. Never retries. */
  abstract sendOtp(phone: E164Phone, code: string): Promise<void>;
}
