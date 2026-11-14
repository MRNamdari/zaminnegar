import { ConflictException } from '@nestjs/common';

export class GeometryOverlapError extends ConflictException {
  constructor(kind: 'region' | 'block' | 'parcel', otherName: string, overlapM2: number) {
    super({
      code: 'GEOMETRY_OVERLAP',
      message: `The ${kind} boundary overlaps "${otherName}" by ${overlapM2.toFixed(2)} m²`,
    });
  }
}
