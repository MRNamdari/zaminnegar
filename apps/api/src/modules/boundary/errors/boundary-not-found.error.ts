import { NotFoundException } from '@nestjs/common';

export class BoundaryNotFoundError extends NotFoundException {
  constructor(id: string) {
    super({ code: 'BOUNDARY_NOT_FOUND', message: `Boundary ${id} was not found` });
  }
}
