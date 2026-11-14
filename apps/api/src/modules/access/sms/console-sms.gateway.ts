import { Injectable, Logger } from '@nestjs/common';
import type { E164Phone } from '../access.types';
import type { OtpPurpose } from '../entities/otp-challenge.entity';
import { SmsGateway } from './sms.gateway';

/**
 * Development gateway: prints the code instead of sending it. It deliberately logs a secret, so the module refuses
 * to start with it in production unless `SMS_ALLOW_CONSOLE_IN_PRODUCTION=true`.
 */
@Injectable()
export class ConsoleSmsGateway extends SmsGateway {
  private readonly logger = new Logger('SMS');

  sendOtp(phone: E164Phone, code: string, purpose: OtpPurpose): Promise<void> {
    this.logger.warn(`[mock] OTP for ${phone} (${purpose}): ${code}`);
    return Promise.resolve();
  }
}
