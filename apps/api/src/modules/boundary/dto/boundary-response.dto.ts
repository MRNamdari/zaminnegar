import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';
import { IBoundary } from '../../../common/interfaces/boundary.interface';
import { IMultiPolygon } from '../../../common/interfaces/geometry.interface';

export class BoundaryResponseDto {
  @ApiProperty({ format: 'uuid' }) @Expose() id!: string;
  @ApiProperty({ format: 'uuid' }) @Expose() projectId!: string;
  @ApiProperty() @Expose() name!: string;
  @ApiProperty({ type: 'object', additionalProperties: true }) @Expose() geometry!: IMultiPolygon;
  @ApiProperty({ description: 'Geodesic area in square meters' }) @Expose() areaM2!: number;
  @ApiProperty() @Expose() createdAt!: Date;
  @ApiProperty() @Expose() updatedAt!: Date;

  static from(boundary: IBoundary): BoundaryResponseDto {
    return plainToInstance(BoundaryResponseDto, boundary, { excludeExtraneousValues: true });
  }
}
