import { HttpStatus } from '@nestjs/common';
import { AppError } from '../../../common/errors/app.error';

/** No block exists with the requested id. */
export class BlockNotFoundError extends AppError {
  readonly statusCode = HttpStatus.NOT_FOUND;
  readonly code = 'BLOCK_NOT_FOUND';

  constructor(blockId?: string) {
    super(blockId ? `Block ${blockId} not found.` : 'Block not found.');
  }
}
