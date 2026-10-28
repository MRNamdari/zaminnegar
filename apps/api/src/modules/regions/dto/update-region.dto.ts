import { PartialType } from '@nestjs/swagger';
import { CreateRegionDto } from './create-region.dto';

/** Body of `PATCH /regions/{regionId}`. Every field is optional. */
export class UpdateRegionDto extends PartialType(CreateRegionDto) {}
