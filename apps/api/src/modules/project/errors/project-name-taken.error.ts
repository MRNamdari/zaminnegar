import { ConflictException } from '@nestjs/common';

export class ProjectNameTakenError extends ConflictException {
  constructor(name: string) {
    super({ code: 'PROJECT_NAME_TAKEN', message: `A project named "${name}" already exists` });
  }
}
