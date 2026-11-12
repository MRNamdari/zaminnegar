import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProjectScope, RequirePermission } from '../access/decorators/access.decorators';
import { Action, Resource } from '../access/permissions';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginatedResult } from '../../common/utils/paginate';
import { CreateBoundaryCommand } from './commands/create-boundary.command';
import { DeleteBoundaryCommand } from './commands/delete-boundary.command';
import { UpdateBoundaryCommand } from './commands/update-boundary.command';
import { CreateBoundaryDto } from './dto/create-boundary.dto';
import { BoundaryQueryDto } from './dto/boundary-query.dto';
import { BoundaryResponseDto } from './dto/boundary-response.dto';
import { UpdateBoundaryDto } from './dto/update-boundary.dto';
import { Boundary } from './entities/boundary.entity';
import { GetBoundaryQuery } from './queries/get-boundary.query';
import { ListBoundariesQuery } from './queries/list-boundaries.query';

@ApiTags('boundaries')
@ApiBearerAuth()
@Controller('boundaries')
export class BoundaryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequirePermission(Resource.boundary, Action.create, { scope: 'body' })
  @RequirePermission(Resource.boundary, Action.create, { scope: 'body' })
  @ApiOperation({ summary: 'Create a boundary', description: 'Creates a draft boundary; it becomes a region, block or parcel outline when one is created with its boundaryId' })
  @ApiCreatedResponse({ type: BoundaryResponseDto })
  async create(@Body() dto: CreateBoundaryDto): Promise<BoundaryResponseDto> {
    const entity = await this.commandBus.execute<CreateBoundaryCommand, Boundary>(new CreateBoundaryCommand(dto));
    return BoundaryResponseDto.from(entity);
  }

  @Get()
  @RequirePermission(Resource.boundary, Action.read, { scope: 'query' })
  @RequirePermission(Resource.boundary, Action.read, { scope: 'query' })
  @ApiOperation({ summary: 'List boundaries' })
  @ApiPaginatedResponse(BoundaryResponseDto)
  async list(@Query() query: BoundaryQueryDto, @ProjectScope() projectScope: string[] | null): Promise<PaginatedResponseDto<BoundaryResponseDto>> {
    const result = await this.queryBus.execute<ListBoundariesQuery, PaginatedResult<Boundary>>(new ListBoundariesQuery(query, projectScope));
  async list(@Query() query: BoundaryQueryDto, @ProjectScope() projectScope: string[] | null): Promise<PaginatedResponseDto<BoundaryResponseDto>> {
    const result = await this.queryBus.execute<ListBoundariesQuery, PaginatedResult<Boundary>>(new ListBoundariesQuery(query, projectScope));
    return PaginatedResponseDto.of(result, BoundaryResponseDto.from);
  }

  @Get(':id')
  @RequirePermission(Resource.boundary, Action.read)
  @RequirePermission(Resource.boundary, Action.read)
  @ApiOperation({ summary: 'Get a boundary by id' })
  @ApiOkResponse({ type: BoundaryResponseDto })
  async get(@Param('id', ParseUUIDPipe) id: string): Promise<BoundaryResponseDto> {
    const entity = await this.queryBus.execute<GetBoundaryQuery, Boundary>(new GetBoundaryQuery(id));
    return BoundaryResponseDto.from(entity);
  }

  @Patch(':id')
  @RequirePermission(Resource.boundary, Action.update)
  @RequirePermission(Resource.boundary, Action.update)
  @ApiOperation({ summary: 'Update a boundary' })
  @ApiOkResponse({ type: BoundaryResponseDto })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBoundaryDto): Promise<BoundaryResponseDto> {
    const entity = await this.commandBus.execute<UpdateBoundaryCommand, Boundary>(new UpdateBoundaryCommand(id, dto));
    return BoundaryResponseDto.from(entity);
  }

  @Delete(':id')
  @RequirePermission(Resource.boundary, Action.delete)
  @RequirePermission(Resource.boundary, Action.delete)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a boundary' })
  @ApiNoContentResponse()
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.commandBus.execute<DeleteBoundaryCommand, void>(new DeleteBoundaryCommand(id));
  }
}
