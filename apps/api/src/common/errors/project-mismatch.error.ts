import { UnprocessableEntityException } from '@nestjs/common';

/** A referenced resource exists but belongs to a different project. */
export class ProjectMismatchError extends UnprocessableEntityException {
  constructor(resource: 'boundary' | 'region' | 'block' | 'owner', id: string) {
    super({
      code: 'PROJECT_MISMATCH',
      message: `The ${resource} ${id} does not belong to the same project`,
    });
  }
}
