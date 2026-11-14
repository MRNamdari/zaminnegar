import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';
import { MultiPolygonField } from '../../../common/decorators/multi-polygon-field.decorator';
import { IMultiPolygon } from '../../../common/interfaces/geometry.interface';

export class CreateBoundaryDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  projectId!: string;

  @ApiProperty({ maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @MultiPolygonField()
  geometry!: IMultiPolygon;
}
