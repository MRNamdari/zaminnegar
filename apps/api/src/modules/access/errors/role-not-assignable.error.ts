import { UnprocessableEntityException } from '@nestjs/common';

export class RoleNotAssignableError extends UnprocessableEntityException {
  constructor() {
    super({ code: 'ROLE_NOT_ASSIGNABLE', message: 'This role cannot be assigned here' });
  }
}
