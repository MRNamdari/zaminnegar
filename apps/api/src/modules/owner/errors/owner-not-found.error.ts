import { NotFoundException } from '@nestjs/common';

export class OwnerNotFoundError extends NotFoundException {
  constructor(id: string) {
    super({ code: 'OWNER_NOT_FOUND', message: `Owner ${id} was not found` });
  }
}
