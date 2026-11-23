import { NotFoundException } from '@nestjs/common';

/** Also raised for a feature of a project the caller has nothing to do with, so ids cannot be probed. */
export class MapFeatureNotFoundError extends NotFoundException {
  constructor(id: string) {
    super({ code: 'MAP_FEATURE_NOT_FOUND', message: `Map feature ${id} was not found` });
  }
}
