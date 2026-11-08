import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID, Max, Min } from 'class-validator';

export class AssignOwnerDto {
  @ApiProperty({ format: 'uuid', description: 'Must belong to the same project as the parcel' })
  @IsUUID()
  ownerId!: string;

  @ApiProperty({ minimum: 0.0001, maximum: 100, description: 'Percent of the parcel; all shares of a parcel sum to ≤ 100' })
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 4 })
  @Min(0.0001)
  @Max(100)
  sharePct!: number;
}
