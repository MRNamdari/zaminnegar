import { PartialType } from '@nestjs/swagger';
import { CreateBlockDto } from './create-block.dto';

/** Body of `PATCH /regions/{regionId}/blocks/{blockId}`. Every field is optional. */
export class UpdateBlockDto extends PartialType(CreateBlockDto) {}
