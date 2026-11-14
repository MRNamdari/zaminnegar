import { PickType } from '@nestjs/swagger';
import { AssignOwnerDto } from './assign-owner.dto';

export class UpdateOwnershipDto extends PickType(AssignOwnerDto, ['sharePct'] as const) {}
