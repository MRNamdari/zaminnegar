import { PartialType } from '@nestjs/swagger';
import { CreateParcelDto } from './create-parcel.dto';

/**
 * Body of `PATCH /projects/{projectId}/parcels/{parcelId}`.
 * Every field of {@link CreateParcelDto} is optional; omitted fields stay untouched.
 */
export class UpdateParcelDto extends PartialType(CreateParcelDto) {}
