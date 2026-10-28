import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';
import { ApiUuidParam } from '../../common/decorators/api-uuid-param.decorator';
import { CreateRegionCommand } from './commands/create-region/create-region.command';
import { CreateRegionDto } from './dto/create-region.dto';
import { ListRegionsQueryDto } from './dto/list-regions-query.dto';
import { RegionListDto } from './dto/region-list.dto';
import { RegionDto } from './dto/region.dto';
import { GetRegionQuery } from './queries/get-region/get-region.query';
import { ListRegionsQuery } from './queries/list-regions/list-regions.query';

/** REST endpoints for regions: `/api/v1/regions`. */
@ApiTags('Regions')
@Controller({ path: 'regions', version: '1' })
export class RegionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a region',
    description: 'Region names are unique.',
  })
  @ApiCreatedResponse({ description: 'The created region.', type: RegionDto })
  @ApiConflictResponse({
    description: 'A region with this name already exists.',
  })
  @ApiErrorResponses(400, 409)
  async create(@Body() body: CreateRegionDto): Promise<RegionDto> {
    const region = await this.commandBus.execute(
      new CreateRegionCommand(body.name, body.description, body.territory),
    );
    return RegionDto.fromRegion(region);
  }

  @Get()
  @ApiOperation({
    summary: 'List regions',
    description:
      'Most recently changed regions first. Each region carries its parcel count and extent.',
  })
  @ApiOkResponse({ description: 'One page of regions.', type: RegionListDto })
  @ApiErrorResponses(400)
  async list(@Query() query: ListRegionsQueryDto): Promise<RegionListDto> {
    const { items, total } = await this.queryBus.execute(
      new ListRegionsQuery(query.limit, query.offset),
    );
    return {
      items: items.map(RegionDto.fromRegion),
      total,
      limit: query.limit,
      offset: query.offset,
    };
  }

  @Get(':regionId')
  @ApiOperation({ summary: 'Get a region' })
  @ApiUuidParam(
    'regionId',
    'region id.',
    '5f0c8f0e-2d41-4b6a-9d4e-8a1f0c2b7e11',
  )
  @ApiOkResponse({ description: 'The region.', type: RegionDto })
  @ApiErrorResponses(400, 404)
  async get(
    @Param('regionId', ParseUUIDPipe) regionId: string,
  ): Promise<RegionDto> {
    return RegionDto.fromRegion(
      await this.queryBus.execute(new GetRegionQuery(regionId)),
    );
  }
}
