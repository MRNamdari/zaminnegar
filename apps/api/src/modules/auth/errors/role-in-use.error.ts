import { ConflictException } from '@nestjs/common';

export class RoleInUseError extends ConflictException {
  constructor(name: string) {
    super({ code: 'ROLE_IN_USE', message: `The role "${name}" is still assigned to members` });
  }
}
