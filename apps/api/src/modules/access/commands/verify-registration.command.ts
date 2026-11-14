import type { VerifyRegistrationDto } from '../dto/verify-registration.dto';

export class VerifyRegistrationCommand {
  constructor(
    public readonly dto: VerifyRegistrationDto,
  ) {}
}
