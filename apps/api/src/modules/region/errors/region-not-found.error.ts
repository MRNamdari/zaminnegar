import { NotFoundException } from '@nestjs/common';

export class RegionNotFoundError extends NotFoundException {
  constructor(id: string) {
    super({ code: 'REGION_NOT_FOUND', message: `Region ${id} was not found` });
  }
}
