import { ConflictException } from '@nestjs/common';

export class BoundaryInUseError extends ConflictException {
  constructor(id: string) {
    super({ code: 'BOUNDARY_IN_USE', message: `Boundary ${id} already belongs to a region, block or parcel` });
  }
}
