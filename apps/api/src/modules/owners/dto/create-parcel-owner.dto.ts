import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

/** Body of `POST /parcels/{parcelId}/owners`. */
export class CreateParcelOwnerDto {
  @ApiProperty({
    description: 'Owner id to attach to the parcel.',
    format: 'uuid',
    example: 'b6f0f4b9-b615-4d33-a4d2-70fb4f37af2a',
  })
  ownerId!: string;

  @ApiProperty({
    description: 'Ownership share in the range [0, 1].',
    minimum: 0,
    maximum: 1,
    example: 0.5,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  share!: number;
}
