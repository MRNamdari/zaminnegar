import { UnprocessableEntityException } from '@nestjs/common';

export class BlockRegionMismatchError extends UnprocessableEntityException {
  constructor(blockId: string, regionId: string) {
    super({ code: 'BLOCK_REGION_MISMATCH', message: `Block ${blockId} does not belong to region ${regionId}` });
  }
}
