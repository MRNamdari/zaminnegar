import { UnprocessableEntityException } from '@nestjs/common';

/** The outline of a block/parcel is not inside any region of its project. */
export class NoContainingRegionError extends UnprocessableEntityException {
  constructor(kind: 'block' | 'parcel') {
    super({
      code: 'NO_CONTAINING_REGION',
      message: `The ${kind} boundary is not inside any region of this project`,
    });
  }
}
