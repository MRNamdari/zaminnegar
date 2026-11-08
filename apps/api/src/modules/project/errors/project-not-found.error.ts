import { NotFoundException } from '@nestjs/common';

export class ProjectNotFoundError extends NotFoundException {
  constructor(id: string) {
    super({ code: 'PROJECT_NOT_FOUND', message: `Project ${id} was not found` });
  }
}
