import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateBoundaryDto } from './create-boundary.dto';

export class UpdateBoundaryDto extends PartialType(OmitType(CreateBoundaryDto, ['projectId'] as const)) {}
