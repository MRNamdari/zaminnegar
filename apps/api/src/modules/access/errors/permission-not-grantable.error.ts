import { UnprocessableEntityException } from '@nestjs/common';

export class PermissionNotGrantableError extends UnprocessableEntityException {
  constructor(keys: readonly string[]) {
    super({ code: 'PERMISSION_NOT_GRANTABLE', message: `These permissions do not exist or cannot be granted by a project role: ${keys.join(', ')}` });
  }
}
