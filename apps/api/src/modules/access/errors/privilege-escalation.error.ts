import { ForbiddenException } from '@nestjs/common';

export class PrivilegeEscalationError extends ForbiddenException {
  constructor() {
    super({ code: 'PRIVILEGE_ESCALATION', message: 'You cannot grant or change permissions that you do not hold yourself' });
  }
}
