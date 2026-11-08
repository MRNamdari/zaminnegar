import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginatedResult } from '../../common/utils/paginate';
import { CreateRegionCommand, CreateRegionInput } from './commands/create-region.command';
import { DeleteRegionCommand } from './commands/delete-region.command';
import { UpdateRegionCommand } from './commands/update-region.command';
import { CreateRegionDto } from './dto/create-region.dto';
import { RegionQueryDto } from './dto/region-query.dto';
import { RegionResponseDto } from './dto/region-response.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { Region } from './entities/region.entity';
import { GetRegionQuery } from './queries/get-region.query';
import { ListRegionsQuery } from './queries/list-regions.query';

@ApiTags('regions')
@Controller('regions')
export class RegionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a region', description: 'Send geometry, or the boundaryId of a finished draft' })
  @ApiCreatedResponse({ type: RegionResponseDto })
  async create(@Body() dto: CreateRegionDto): Promise<RegionResponseDto> {
    const entity = await this.commandBus.execute<CreateRegionCommand, Region>(new CreateRegionCommand(dto as CreateRegionInput));
    return RegionResponseDto.from(entity);
  }

  @Get()
  @ApiOperation({ summary: 'List regions' })
  @ApiPaginatedResponse(RegionResponseDto)
  async list(@Query() query: RegionQueryDto): Promise<PaginatedResponseDto<RegionResponseDto>> {
    const result = await this.queryBus.execute<ListRegionsQuery, PaginatedResult<Region>>(new ListRegionsQuery(query));
    return PaginatedResponseDto.of(result, RegionResponseDto.from);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a region by id' })
  @ApiOkResponse({ type: RegionResponseDto })
  async get(@Param('id', ParseUUIDPipe) id: string): Promise<RegionResponseDto> {
    const entity = await this.queryBus.execute<GetRegionQuery, Region>(new GetRegionQuery(id));
    return RegionResponseDto.from(entity);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a region' })
  @ApiOkResponse({ type: RegionResponseDto })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRegionDto): Promise<RegionResponseDto> {
    const entity = await this.commandBus.execute<UpdateRegionCommand, Region>(new UpdateRegionCommand(id, dto));
    return RegionResponseDto.from(entity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a region' })
  @ApiNoContentResponse()
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.commandBus.execute<DeleteRegionCommand, void>(new DeleteRegionCommand(id));
  }
}
