import { ConflictException } from '@nestjs/common';

export class RegionNameTakenError extends ConflictException {
  constructor(name: string) {
    super({ code: 'REGION_NAME_TAKEN', message: `A region named "${name}" already exists in this project` });
  }
}
