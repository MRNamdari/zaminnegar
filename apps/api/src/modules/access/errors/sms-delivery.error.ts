import { BadGatewayException } from '@nestjs/common';

export class SmsDeliveryError extends BadGatewayException {
  constructor() {
    super({ code: 'SMS_DELIVERY_FAILED', message: 'The verification code could not be sent' });
  }
}
