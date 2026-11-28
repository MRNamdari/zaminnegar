import { ConflictException } from '@nestjs/common';

export class SystemRoleImmutableError extends ConflictException {
  constructor(name: string) {
    super({ code: 'SYSTEM_ROLE_IMMUTABLE', message: `The predefined role "${name}" cannot be changed or deleted` });
  }
}
