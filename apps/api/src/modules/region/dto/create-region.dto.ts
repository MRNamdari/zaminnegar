import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, ValidateIf } from 'class-validator';
import { MultiPolygonField } from '../../../common/decorators/multi-polygon-field.decorator';
import { RegionStatus } from '../../../common/enums/region-status.enum';
import { IMultiPolygon } from '../../../common/interfaces/geometry.interface';

interface CreateDtoShape {
  boundaryId?: string;
  geometry?: IMultiPolygon;
}

export class CreateRegionDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  projectId!: string;

  @ApiProperty({ maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ default: '' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: RegionStatus, enumName: 'RegionStatus', default: RegionStatus.active })
  @IsOptional()
  @IsEnum(RegionStatus)
  status?: RegionStatus;

  /**
   * A finished draft boundary of the same project that no region, block or parcel owns yet.
   * Send either `boundaryId` or `geometry`.
   */
  @ApiPropertyOptional({ format: 'uuid', description: 'Existing draft boundary to use instead of geometry' })
  @ValidateIf((o: CreateDtoShape) => o.geometry === undefined)
  @IsUUID()
  boundaryId?: string;

  /** Without `boundaryId`, the handler creates the region's boundary row from this geometry in the same transaction. */
  @ValidateIf((o: CreateDtoShape) => o.boundaryId === undefined)
  @MultiPolygonField({ optional: true })
  geometry?: IMultiPolygon;
}
