import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateParcelDto } from './create-parcel.dto';

export class UpdateParcelDto extends PartialType(OmitType(CreateParcelDto, ['projectId', 'boundaryId'] as const)) {}
