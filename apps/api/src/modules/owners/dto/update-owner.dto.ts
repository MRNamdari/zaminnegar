import { PartialType } from '@nestjs/swagger';
import { CreateOwnerDto } from './create-owner.dto';

/** Body of `PATCH /owners/{ownerId}`. Every field is optional. */
export class UpdateOwnerDto extends PartialType(CreateOwnerDto) {}
