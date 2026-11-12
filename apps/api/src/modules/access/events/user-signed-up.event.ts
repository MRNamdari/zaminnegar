import type { IEvent } from '@nestjs/cqrs';
import type { E164Phone } from '../access.types';

/** Published after a first successful OTP verification created the account. Subscribe with `@EventsHandler`. */
export class UserSignedUpEvent implements IEvent {
  constructor(
    readonly userId: string,
    readonly phone: E164Phone,
  ) {}
}
