import { NotFoundException } from '@nestjs/common';

export class RoleNotFoundError extends NotFoundException {
  constructor(id: string) {
    super({ code: 'ROLE_NOT_FOUND', message: `Role ${id} was not found` });
  }
}
