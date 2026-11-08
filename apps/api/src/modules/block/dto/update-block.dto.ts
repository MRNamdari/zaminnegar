import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateBlockDto } from './create-block.dto';

export class UpdateBlockDto extends PartialType(OmitType(CreateBlockDto, ['projectId', 'boundaryId'] as const)) {}
