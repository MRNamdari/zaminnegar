import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { MultiPolygonField } from '../../../common/decorators/multi-polygon-field.decorator';
import { ParcelStatus } from '../../../common/enums/parcel-status.enum';
import { IMultiPolygon } from '../../../common/interfaces/geometry.interface';

/**
 * `regionId`, `blockId`, `areaM2`, `regionOccupancyPct` and `blockOccupancyPct` are derived from the outline by the
 * database and cannot be sent.
 */
interface CreateDtoShape {
  boundaryId?: string;
  geometry?: IMultiPolygon;
}

export class CreateParcelDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  projectId!: string;

  @ApiProperty({ maxLength: 200, minLength: 1 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({
    enum: ParcelStatus,
    enumName: 'ParcelStatus',
    default: ParcelStatus.active,
  })
  @IsOptional()
  @IsEnum(ParcelStatus)
  status?: ParcelStatus;

  /**
   * A finished draft boundary of the same project that no region, block or parcel owns yet.
   * Send either `boundaryId` or `geometry`.
   */
  @ApiPropertyOptional({
    type: 'string',
    format: 'uuid',
    description: 'Existing draft boundary to use instead of geometry',
  })
  @ValidateIf((o: CreateDtoShape) => o.geometry === undefined)
  @IsUUID()
  boundaryId?: string;

  /** Without `boundaryId`, the handler creates the parcel's boundary row from this geometry in the same transaction. */
  @ValidateIf((o: CreateDtoShape) => o.boundaryId === undefined)
  @MultiPolygonField({ optional: true })
  geometry?: IMultiPolygon;
}
