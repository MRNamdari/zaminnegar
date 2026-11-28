import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiSessionAuth,
  AuthenticatedOnly,
  CurrentPrincipal,
  ProjectScope,
  RequirePermission,
} from '../auth/decorators/access.decorators';
import { ApiErrorResponse } from '../auth/decorators/api-error-responses.decorator';
import type { Principal } from '../auth/auth.types';
import { Action, Resource } from '../auth/permissions';
import { CreateMapFeatureCommand } from './commands/create-map-feature.command';
import { DeleteMapFeatureCommand } from './commands/delete-map-feature.command';
import { UpdateMapFeatureCommand } from './commands/update-map-feature.command';
import { CreateMapFeatureDto } from './dto/create-map-feature.dto';
import { MapFeatureResponseDto } from './dto/map-feature-response.dto';
import { MapFeaturesQueryDto } from './dto/map-features-query.dto';
import { MapFeaturesResponseDto } from './dto/map-features-response.dto';
import { UpdateMapFeatureDto } from './dto/update-map-feature.dto';
import { GetMapFeaturesQuery } from './queries/get-map-features.query';

@ApiTags('map')
@ApiSessionAuth()
@Controller('map')
export class MapController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

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

  // The three routes below need the permission of the feature's level (region, block or parcel), which is only
  // known once the feature is read, so the handler decides access (AuthenticatedOnly) like the other routes whose
  // authorization depends on the record.

  @Post('features')
  @AuthenticatedOnly()
  @ApiOperation({
    summary: 'Create a region, block or parcel from a drawn polygon',
    description:
      'Created in the active project (`PUT /auth/session/project`). Returns the feature as the list does, including ' +
      'what the database derived: area and parent.',
  })
  @ApiCreatedResponse({ type: MapFeatureResponseDto })
  @ApiErrorResponse(
    409,
    'No active project (`NO_ACTIVE_PROJECT`), name taken, or the outline overlaps a sibling',
  )
  @ApiErrorResponse(
    422,
    'The outline breaks a containment rule (`GEOMETRY_OUTSIDE_CONTAINER`, `NO_CONTAINING_REGION`)',
  )
  create(
    @Body() dto: CreateMapFeatureDto,
    @CurrentPrincipal() principal: Principal,
  ): Promise<MapFeatureResponseDto> {
    return this.commandBus.execute(new CreateMapFeatureCommand(dto, principal));
  }

  @Patch('features/:id')
  @AuthenticatedOnly()
  @ApiOperation({
    summary: 'Change a map feature',
    description:
      'Only the fields that are sent change. The level is found from the id. The response carries the derived ' +
      "values after the change: area and parent. Other features may change too (a parent's area, children).",
  })
  @ApiOkResponse({ type: MapFeatureResponseDto })
  @ApiErrorResponse(404, 'No such feature (`MAP_FEATURE_NOT_FOUND`)')
  @ApiErrorResponse(409, 'Name taken, or the outline overlaps a sibling')
  @ApiErrorResponse(
    422,
    'The outline breaks a containment rule (`GEOMETRY_OUTSIDE_CONTAINER`, `CHILD_OUTSIDE_GEOMETRY`)',
  )
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMapFeatureDto,
    @CurrentPrincipal() principal: Principal,
  ): Promise<MapFeatureResponseDto> {
    return this.commandBus.execute(
      new UpdateMapFeatureCommand(id, dto, principal),
    );
  }

  @Delete('features/:id')
  @AuthenticatedOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a map feature',
    description: 'Refused while a region or block still contains features.',
  })
  @ApiNoContentResponse()
  @ApiErrorResponse(404, 'No such feature (`MAP_FEATURE_NOT_FOUND`)')
  @ApiErrorResponse(
    409,
    'Still contains features (`REGION_NOT_EMPTY`, `BLOCK_NOT_EMPTY`)',
  )
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentPrincipal() principal: Principal,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteMapFeatureCommand(id, principal));
  }
}
