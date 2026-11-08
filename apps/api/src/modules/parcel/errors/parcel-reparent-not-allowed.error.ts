import { UnprocessableEntityException } from '@nestjs/common';

export class ParcelReparentNotAllowedError extends UnprocessableEntityException {
  constructor() {
    super({ code: 'PARCEL_REPARENT_NOT_ALLOWED', message: 'A parcel cannot be moved to another region or block' });
  }
}
