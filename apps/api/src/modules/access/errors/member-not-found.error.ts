import { NotFoundException } from '@nestjs/common';

export class MemberNotFoundError extends NotFoundException {
  constructor() {
    super({ code: 'MEMBER_NOT_FOUND', message: 'The user is not a member of this project' });
  }
}
