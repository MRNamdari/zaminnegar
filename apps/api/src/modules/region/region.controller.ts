import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginatedResult } from '../../common/utils/paginate';
import { ProjectScope, RequirePermission } from '../access/decorators/access.decorators';
import { Action, Resource } from '../access/permissions';
import { ParcelResponseDto } from '../parcel/dto/parcel-response.dto';
import { ListRegionParcelsQuery } from '../parcel/queries/list-region-parcels.query';
import { CreateRegionCommand, CreateRegionInput } from './commands/create-region.command';
import { DeleteRegionCommand } from './commands/delete-region.command';
import { UpdateRegionCommand } from './commands/update-region.command';
import { CreateRegionDto } from './dto/create-region.dto';
import { RegionDetailResponseDto } from './dto/region-detail-response.dto';
import { RegionDetailResponseDto } from './dto/region-detail-response.dto';
import { RegionQueryDto } from './dto/region-query.dto';
import { RegionResponseDto } from './dto/region-response.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { Region } from './entities/region.entity';
import { GetRegionDetailQuery } from './queries/get-region-detail.query';
import { GetRegionDetailQuery } from './queries/get-region-detail.query';
import { GetRegionQuery } from './queries/get-region.query';
import { ListRegionsQuery } from './queries/list-regions.query';

@ApiTags('regions')
@ApiBearerAuth()
@Controller('regions')
export class RegionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequirePermission(Resource.region, Action.create, { scope: 'body' })
  @RequirePermission(Resource.region, Action.create, { scope: 'body' })
  @ApiOperation({
    summary: 'Create a region',
    description: 'Send geometry, or the boundaryId of a finished draft',
  })
  @ApiCreatedResponse({ type: RegionResponseDto })
  async create(@Body() dto: CreateRegionDto): Promise<RegionResponseDto> {
    const entity = await this.commandBus.execute<CreateRegionCommand, Region>(
      new CreateRegionCommand(dto as CreateRegionInput),
    );
    return RegionResponseDto.from(entity);
  }

  @Get()
  @RequirePermission(Resource.region, Action.read, { scope: 'query' })
  @ApiOperation({ summary: 'List regions', description: 'Each region carries the number of blocks and parcels it contains' })
  @RequirePermission(Resource.region, Action.read, { scope: 'query' })
  @ApiOperation({ summary: 'List regions', description: 'Each region carries the number of blocks and parcels it contains' })
  @ApiPaginatedResponse(RegionResponseDto)
  async list(
    @Query() query: RegionQueryDto,
    @ProjectScope() projectScope: string[] | null,
    @ProjectScope() projectScope: string[] | null,
  ): Promise<PaginatedResponseDto<RegionResponseDto>> {
    const result = await this.queryBus.execute<ListRegionsQuery, PaginatedResult<Region>>(
      new ListRegionsQuery(query, projectScope),
    );
    const result = await this.queryBus.execute<ListRegionsQuery, PaginatedResult<Region>>(
      new ListRegionsQuery(query, projectScope),
    );
    return PaginatedResponseDto.of(result, RegionResponseDto.from);
  }

  @Get(':id')
  @RequirePermission(Resource.region, Action.read)
  @RequirePermission(Resource.region, Action.read)
  @ApiOperation({ summary: 'Get a region by id' })
  @ApiOkResponse({ type: RegionResponseDto })
  async get(@Param('id', ParseUUIDPipe) id: string): Promise<RegionResponseDto> {
    const entity = await this.queryBus.execute<GetRegionQuery, Region>(new GetRegionQuery(id));
  async get(@Param('id', ParseUUIDPipe) id: string): Promise<RegionResponseDto> {
    const entity = await this.queryBus.execute<GetRegionQuery, Region>(new GetRegionQuery(id));
    return RegionResponseDto.from(entity);
  }

  @Get(':id/detail')
  @RequirePermission(Resource.region, Action.read)
  @ApiOperation({ summary: 'Get a region with project, boundary, blocks and parcels' })
  @ApiOkResponse({ type: RegionDetailResponseDto })
  async getDetail(@Param('id', ParseUUIDPipe) id: string): Promise<RegionDetailResponseDto> {
    const entity = await this.queryBus.execute<GetRegionDetailQuery, Region>(new GetRegionDetailQuery(id));
    return RegionDetailResponseDto.from(entity);
  }

  @Get(':id/detail')
  @RequirePermission(Resource.region, Action.read)
  @ApiOperation({ summary: 'Get a region with project, boundary, blocks and parcels' })
  @ApiOkResponse({ type: RegionDetailResponseDto })
  async getDetail(@Param('id', ParseUUIDPipe) id: string): Promise<RegionDetailResponseDto> {
    const entity = await this.queryBus.execute<GetRegionDetailQuery, Region>(new GetRegionDetailQuery(id));
    return RegionDetailResponseDto.from(entity);
  }

  @Patch(':id')
  @RequirePermission(Resource.region, Action.update)
  @RequirePermission(Resource.region, Action.update)
  @ApiOperation({ summary: 'Update a region' })
  @ApiOkResponse({ type: RegionResponseDto })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRegionDto): Promise<RegionResponseDto> {
    const entity = await this.commandBus.execute<UpdateRegionCommand, Region>(new UpdateRegionCommand(id, dto));
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRegionDto): Promise<RegionResponseDto> {
    const entity = await this.commandBus.execute<UpdateRegionCommand, Region>(new UpdateRegionCommand(id, dto));
    return RegionResponseDto.from(entity);
  }

  @Delete(':id')
  @RequirePermission(Resource.region, Action.delete)
  @RequirePermission(Resource.region, Action.delete)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a region' })
  @ApiNoContentResponse()
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.commandBus.execute<DeleteRegionCommand, void>(new DeleteRegionCommand(id));
    await this.commandBus.execute<DeleteRegionCommand, void>(new DeleteRegionCommand(id));
  }

  @Get(':id/parcels')
  @RequirePermission(Resource.parcel, Action.read, { idOf: Resource.region })
  @RequirePermission(Resource.parcel, Action.read, { idOf: Resource.region })
  @ApiOperation({ summary: 'List the parcels a region contains' })
  @ApiOkResponse({ type: ParcelResponseDto, isArray: true })
  async listParcels(@Param('id', ParseUUIDPipe) id: string): Promise<ParcelResponseDto[]> {
    const region = await this.queryBus.execute<ListRegionParcelsQuery, Region>(new ListRegionParcelsQuery(id));
    return (region.parcels ?? []).map(ParcelResponseDto.from);
  @ApiOkResponse({ type: ParcelResponseDto, isArray: true })
  async listParcels(@Param('id', ParseUUIDPipe) id: string): Promise<ParcelResponseDto[]> {
    const region = await this.queryBus.execute<ListRegionParcelsQuery, Region>(new ListRegionParcelsQuery(id));
    return (region.parcels ?? []).map(ParcelResponseDto.from);
  }
}
