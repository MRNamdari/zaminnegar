import { ConflictException } from '@nestjs/common';

export class RoleNameTakenError extends ConflictException {
  constructor(name: string) {
    super({ code: 'ROLE_NAME_TAKEN', message: `A role named "${name}" already exists in this project` });
  }
}
