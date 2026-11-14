import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance, Type } from 'class-transformer';
import { MapFeatureResponseDto } from './map-feature-response.dto';

export class MapFeaturesResponseDto {
  @ApiProperty({ enum: ['FeatureCollection'] })
  @Expose()
  type!: 'FeatureCollection';

  @ApiProperty({ type: [MapFeatureResponseDto] })
  @Expose()
  @Type(() => MapFeatureResponseDto)
  features!: MapFeatureResponseDto[];

  static from(features: MapFeatureResponseDto[]): MapFeaturesResponseDto {
    return plainToInstance(
      MapFeaturesResponseDto,
      { type: 'FeatureCollection', features },
      { excludeExtraneousValues: true },
    );
  }
}
