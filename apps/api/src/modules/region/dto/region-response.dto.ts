import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';
import { RegionStatus } from '../../../common/enums/region-status.enum';
import { IRegion } from '../../../common/interfaces/region.interface';

export class RegionResponseDto {
  @ApiProperty({ format: 'uuid' }) @Expose() id!: string;
  @ApiProperty({ format: 'uuid' }) @Expose() projectId!: string;
  @ApiProperty({ format: 'uuid' }) @Expose() boundaryId!: string;
  @ApiProperty() @Expose() name!: string;
  @ApiProperty() @Expose() description!: string;
  @ApiProperty({ enum: RegionStatus, enumName: 'RegionStatus' }) @Expose() status!: RegionStatus;
  @ApiProperty() @Expose() createdAt!: Date;
  @ApiProperty() @Expose() updatedAt!: Date;

  static from(region: IRegion): RegionResponseDto {
    return plainToInstance(RegionResponseDto, region, { excludeExtraneousValues: true });
  }
}
