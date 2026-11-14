import { ConflictException } from '@nestjs/common';

export class MemberAlreadyExistsError extends ConflictException {
  constructor() {
    super({ code: 'MEMBER_ALREADY_EXISTS', message: 'The user is already a member of this project' });
  }
}
