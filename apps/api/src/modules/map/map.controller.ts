import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiSessionAuth,
  CurrentPrincipal,
  ProjectScope,
  RequirePermission,
} from '../access/decorators/access.decorators';
import type { Principal } from '../access/access.types';
import { Action, Resource } from '../access/permissions';
import { MapFeaturesQueryDto } from './dto/map-features-query.dto';
import { MapFeaturesResponseDto } from './dto/map-features-response.dto';
import { GetMapFeaturesQuery } from './queries/get-map-features.query';

@ApiTags('map')
@ApiSessionAuth()
@Controller('map')
export class MapController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('features')
  @RequirePermission(Resource.boundary, Action.read, { scope: 'query' })
  @ApiOperation({ summary: 'Get map editor features for a project' })
  @ApiOkResponse({ type: MapFeaturesResponseDto })
  getFeatures(
    @Query() query: MapFeaturesQueryDto,
    @ProjectScope() projectScope: string[] | null,
    @CurrentPrincipal() principal: Principal,
  ): Promise<MapFeaturesResponseDto> {
    return this.queryBus.execute(
      new GetMapFeaturesQuery(query, projectScope, principal),
    );
  }
}
