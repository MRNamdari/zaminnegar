import type { ForgotPasswordDto } from '../dto/forgot-password.dto';

export class RequestPasswordResetCommand {
  constructor(
    public readonly dto: ForgotPasswordDto,
    public readonly ip: string | null,
  ) {}
}
