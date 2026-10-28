import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

/** Body of `PATCH /parcels/{parcelId}/owners/{ownerId}`. */
export class UpdateParcelOwnerDto {
  @ApiPropertyOptional({
    description: 'Ownership share for the owner in the parcel, between 0 and 1.',
    minimum: 0,
    maximum: 1,
    example: 0.35,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  share?: number;
}
