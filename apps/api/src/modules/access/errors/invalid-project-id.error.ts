import { BadRequestException } from '@nestjs/common';

export class InvalidProjectIdError extends BadRequestException {
  constructor() {
    super({ code: 'INVALID_PROJECT_ID', message: 'projectId must be a UUID' });
  }
}
