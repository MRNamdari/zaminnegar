import { UnprocessableEntityException } from '@nestjs/common';

export class InvalidGeometryError extends UnprocessableEntityException {
  constructor(reason: string) {
    super({ code: 'INVALID_GEOMETRY', message: `Geometry is not valid: ${reason}` });
  }
}
