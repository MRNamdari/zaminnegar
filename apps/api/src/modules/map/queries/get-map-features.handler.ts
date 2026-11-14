import { Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AccessPolicyService } from '../../access/abilities/access-policy.service';
import { Action, Resource } from '../../access/permissions';
import { MapFeaturesResponseDto } from '../dto/map-features-response.dto';
import { MapFeatureResponseDto } from '../dto/map-feature-response.dto';
import { MapRepository } from '../repositories/map.repository';
import { GetMapFeaturesQuery } from './get-map-features.query';

@QueryHandler(GetMapFeaturesQuery)
export class GetMapFeaturesHandler implements IQueryHandler<
  GetMapFeaturesQuery,
  MapFeaturesResponseDto
> {
  private readonly logger = new Logger(GetMapFeaturesHandler.name);

  constructor(
    private readonly map: MapRepository,
    private readonly access: AccessPolicyService,
  ) {}

  async execute({
    dto,
    projectScope,
    principal,
  }: GetMapFeaturesQuery): Promise<MapFeaturesResponseDto> {
    for (const resource of [
      Resource.boundary,
      Resource.region,
      Resource.block,
      Resource.parcel,
    ]) {
      this.access.assertCan(principal, Action.read, resource, {
        projectId: dto.projectId,
      });
    }

    const { regions, blocks, parcels } = await this.map.findFeatures(
      dto.projectId,
      projectScope,
    );
    const mapped = [
      ...regions.map(MapFeatureResponseDto.fromRegion),
      ...blocks.map(MapFeatureResponseDto.fromBlock),
      ...parcels.map(MapFeatureResponseDto.fromParcel),
    ];
    const features = mapped.filter(
      (feature): feature is MapFeatureResponseDto => feature !== null,
    );

    if (features.length !== mapped.length) {
      this.logger.warn(
        `${mapped.length - features.length} multipart feature(s) omitted from the map response`,
      );
    }

    return MapFeaturesResponseDto.from(features);
  }
}
