import type { E164Phone } from '../access.types';
import type { OtpPurpose } from '../entities/otp-challenge.entity';

/** Port for delivering OTP codes by SMS. Injected by class token; the provider adapter is swappable. */
export abstract class SmsGateway {
  /**
   * Resolves once the provider accepted the message; rejects with `SmsDeliveryError` otherwise. Never retries.
   * `purpose` lets an adapter pick a template; adapters may ignore it.
   */
  abstract sendOtp(phone: E164Phone, code: string, purpose: OtpPurpose): Promise<void>;
}
