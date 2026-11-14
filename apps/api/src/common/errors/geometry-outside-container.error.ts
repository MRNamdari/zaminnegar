import { UnprocessableEntityException } from '@nestjs/common';

export class GeometryOutsideContainerError extends UnprocessableEntityException {
  constructor(kind: 'block' | 'parcel', container: 'region' | 'block', outsideM2: number) {
    super({
      code: 'GEOMETRY_OUTSIDE_CONTAINER',
      message: `The ${kind} boundary extends ${outsideM2.toFixed(2)} m² outside its ${container}`,
    });
  }
}
