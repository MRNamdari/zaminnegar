import { NotFoundException } from '@nestjs/common';

export class ResourceNotFoundError extends NotFoundException {
  constructor() {
    super({ code: 'RESOURCE_NOT_FOUND', message: 'The requested resource was not found' });
  }
}
