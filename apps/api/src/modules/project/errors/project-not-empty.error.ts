import { ConflictException } from '@nestjs/common';

export class ProjectNotEmptyError extends ConflictException {
  constructor(id: string) {
    super({ code: 'PROJECT_NOT_EMPTY', message: `Project ${id} still has regions, boundaries or owners and cannot be deleted` });
  }
}
