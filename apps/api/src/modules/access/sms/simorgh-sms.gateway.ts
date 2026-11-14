import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { E164Phone } from '../access.types';
import { SmsDeliveryError } from '../errors/sms-delivery.error';
import { maskPhone, toLocalIranMobile } from '../utils/iran-phone';
import { SmsGateway } from './sms.gateway';

/** Body of `POST /send-sms/send-sms` (`CreateSendSmDto` in the provider's OpenAPI document). */
export interface SimorghSendSmsRequest {
  /** Local format, e.g. `09123456789`. */
  to: string;
  /** Pattern arguments, comma separated. For the OTP pattern: the code. */
  argsStr: string;
  patternName: string;
  systemName: string;
  patternId?: string;
}

/** https://sms.simorgh.dev: pattern (template) SMS over HTTP with a bearer token. */
@Injectable()
export class SimorghSmsGateway extends SmsGateway {
  private readonly logger = new Logger(SimorghSmsGateway.name);
  private readonly url: string;
  private readonly token: string;
  private readonly patternName: string;
  private readonly patternId: string | undefined;
  private readonly systemName: string;
  private readonly timeoutMs: number;

  constructor(config: ConfigService) {
    super();
    const url = new URL('/send-sms/send-sms', config.get<string>('SMS_BASE_URL') ?? 'https://sms.simorgh.dev');
    const provider = config.get<string>('SMS_PROVIDER');
    if (provider) url.searchParams.set('provider', provider);
    this.url = url.toString();
    this.token = config.getOrThrow<string>('SMS_API_TOKEN');
    this.patternName = config.getOrThrow<string>('SMS_OTP_PATTERN_NAME');
    this.patternId = config.get<string>('SMS_OTP_PATTERN_ID') || undefined;
    this.systemName = config.getOrThrow<string>('SMS_SYSTEM_NAME');
    this.timeoutMs = Number(config.get('SMS_TIMEOUT_MS') ?? 8000);
  }

  async sendOtp(phone: E164Phone, code: string): Promise<void> {
    const body: SimorghSendSmsRequest = {
      to: toLocalIranMobile(phone),
      argsStr: code,
      patternName: this.patternName,
      systemName: this.systemName,
      ...(this.patternId ? { patternId: this.patternId } : {}),
    };

    let response: Response;
    try {
      response = await fetch(this.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.token}` },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      this.logger.error(`SMS request for ${maskPhone(phone)} failed: ${error instanceof Error ? error.name : 'unknown error'}`);
      throw new SmsDeliveryError();
    }

    if (!response.ok) {
      // Never log the code, even if the provider echoes the request back.
      const detail = (await response.text().catch(() => '')).replaceAll(code, '******').slice(0, 300);
      this.logger.error(`SMS provider answered ${response.status} for ${maskPhone(phone)}: ${detail}`);
      throw new SmsDeliveryError();
    }
  }
}
