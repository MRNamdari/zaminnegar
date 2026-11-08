import { UnprocessableEntityException } from '@nestjs/common';

/** The new boundary of a region/block would leave one of its blocks/parcels sticking out. */
export class ChildOutsideGeometryError extends UnprocessableEntityException {
  constructor(childKind: 'block' | 'parcel', childName: string, outsideM2: number) {
    super({
      code: 'CHILD_OUTSIDE_GEOMETRY',
      message: `The new boundary would leave ${childKind} "${childName}" ${outsideM2.toFixed(2)} m² outside`,
    });
  }
}
