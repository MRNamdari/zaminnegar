import { HttpStatus } from '@nestjs/common';
import { AppError } from '../../../common/errors/app.error';

/** A block with the same name already exists inside the region. */
export class BlockNameAlreadyExistsError extends AppError {
  readonly statusCode = HttpStatus.CONFLICT;
  readonly code = 'BLOCK_NAME_ALREADY_EXISTS';

  constructor(name: string) {
    super(`Block ${name} already exists in this region.`);
  }
}
