import { UnprocessableEntityException } from '@nestjs/common';

export class SharesExceededError extends UnprocessableEntityException {
  constructor(requested: number, available: number) {
    super({
      code: 'SHARES_EXCEEDED',
      message: `A share of ${requested}% does not fit: only ${available}% of the parcel is unassigned`,
    });
  }
}
