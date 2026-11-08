import { BadRequestException } from '@nestjs/common';

/** Neither or both of `geometry` / `boundaryId` were supplied. */
export class InvalidBoundarySourceError extends BadRequestException {
  constructor(reason: 'both' | 'none') {
    super({
      code: 'INVALID_BOUNDARY_SOURCE',
      message:
        reason === 'both'
          ? 'Provide either geometry or boundaryId, not both'
          : 'Provide either geometry or boundaryId',
    });
  }
}
