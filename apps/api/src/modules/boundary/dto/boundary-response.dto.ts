import { MultiPolygonField } from '@/common/decorators/multi-polygon-field.decorator';
import { IBoundary } from '@/common/interfaces/boundary.interface';
import { IMultiPolygon } from '@/common/interfaces/geometry.interface';
import { effectiveAreaM2 } from '@/common/utils/effective-area';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance, Transform } from 'class-transformer';

export class BoundaryResponseDto {
  @ApiProperty({ format: 'uuid' }) @Expose() id!: string;
  @ApiProperty({ format: 'uuid' }) @Expose() projectId!: string;
  @ApiProperty() @Expose() name!: string;
  @MultiPolygonField()
  @Expose()
  geometry!: IMultiPolygon;

  @ApiProperty({
    type: 'number',
    description: 'Geodesic area in square meters, computed from the geometry',
  })
  @Expose()
  computedAreaM2!: number;

  @ApiProperty({
    type: 'number',
    nullable: true,
    description: 'Area assigned by the user; null when none was supplied',
  })
  @Expose()
  manualAreaM2!: number | null;

  @ApiProperty({
    type: 'number',
    description: 'manualAreaM2 when set, otherwise computedAreaM2',
  })
  @Expose()
  @Transform(({ obj }: { obj: IBoundary }) => effectiveAreaM2(obj))
  areaM2!: number;

  @ApiProperty() @Expose() createdAt!: Date;
  @ApiProperty() @Expose() updatedAt!: Date;

  static from(boundary: IBoundary): BoundaryResponseDto {
    return plainToInstance(BoundaryResponseDto, boundary, {
      excludeExtraneousValues: true,
    });
  }
}
