import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginatedResult } from '../../common/utils/paginate';
import { ActiveProjectId, ApiSessionAuth, ProjectScope, RequirePermission } from '../access/decorators/access.decorators';
import { ApiErrorResponse } from '../access/decorators/api-error-responses.decorator';
import { Action, Resource } from '../access/permissions';
import { ParcelResponseDto } from '../parcel/dto/parcel-response.dto';
import { ListBlockParcelsQuery } from '../parcel/queries/list-block-parcels.query';
import { CreateBlockCommand, CreateBlockInput } from './commands/create-block.command';
import { DeleteBlockCommand } from './commands/delete-block.command';
import { UpdateBlockCommand } from './commands/update-block.command';
import { BlockDetailResponseDto } from './dto/block-detail-response.dto';
import { BlockQueryDto } from './dto/block-query.dto';
import { BlockResponseDto } from './dto/block-response.dto';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { Block } from './entities/block.entity';
import { GetBlockDetailQuery } from './queries/get-block-detail.query';
import { GetBlockQuery } from './queries/get-block.query';
import { ListBlocksQuery } from './queries/list-blocks.query';

@ApiTags('blocks')
@ApiSessionAuth()
@Controller('blocks')
export class BlockController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequirePermission(Resource.block, Action.create, { scope: 'active' })
  @ApiOperation({
    summary: 'Create a block',
    description:
      'Send geometry, or the boundaryId of a finished draft. The region is not sent: it is the region of the project that contains the block outline.',
  })
  @ApiCreatedResponse({ type: BlockResponseDto })
  @ApiErrorResponse(409, 'No active project selected (`NO_ACTIVE_PROJECT`)')
  async create(@Body() dto: CreateBlockDto, @ActiveProjectId() projectId: string): Promise<BlockResponseDto> {
    const entity = await this.commandBus.execute<CreateBlockCommand, Block>(
      new CreateBlockCommand({ ...dto, projectId } as CreateBlockInput),
    );
    return BlockResponseDto.from(entity);
  }

  @Get()
  @RequirePermission(Resource.block, Action.read, { scope: 'query' })
  @ApiOperation({ summary: 'List blocks', description: 'Each block carries its region and the number of parcels it contains' })
  @ApiPaginatedResponse(BlockResponseDto)
  async list(
    @Query() query: BlockQueryDto,
    @ProjectScope() projectScope: string[] | null,
  ): Promise<PaginatedResponseDto<BlockResponseDto>> {
    const result = await this.queryBus.execute<ListBlocksQuery, PaginatedResult<Block>>(
      new ListBlocksQuery(query, projectScope),
    );
    return PaginatedResponseDto.of(result, BlockResponseDto.from);
  }

  @Get(':id')
  @RequirePermission(Resource.block, Action.read)
  @ApiOperation({ summary: 'Get a block by id' })
  @ApiOkResponse({ type: BlockResponseDto })
  async get(@Param('id', ParseUUIDPipe) id: string): Promise<BlockResponseDto> {
    const entity = await this.queryBus.execute<GetBlockQuery, Block>(new GetBlockQuery(id));
    return BlockResponseDto.from(entity);
  }

  @Get(':id/detail')
  @RequirePermission(Resource.block, Action.read)
  @ApiOperation({ summary: 'Get a block with project, region, boundary and parcels' })
  @ApiOkResponse({ type: BlockDetailResponseDto })
  async getDetail(@Param('id', ParseUUIDPipe) id: string): Promise<BlockDetailResponseDto> {
    const entity = await this.queryBus.execute<GetBlockDetailQuery, Block>(new GetBlockDetailQuery(id));
    return BlockDetailResponseDto.from(entity);
  }

  @Patch(':id')
  @RequirePermission(Resource.block, Action.update)
  @ApiOperation({ summary: 'Update a block' })
  @ApiOkResponse({ type: BlockResponseDto })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBlockDto): Promise<BlockResponseDto> {
    const entity = await this.commandBus.execute<UpdateBlockCommand, Block>(new UpdateBlockCommand(id, dto));
    return BlockResponseDto.from(entity);
  }

  @Delete(':id')
  @RequirePermission(Resource.block, Action.delete)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a block' })
  @ApiNoContentResponse()
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.commandBus.execute<DeleteBlockCommand, void>(new DeleteBlockCommand(id));
  }

  @Get(':id/parcels')
  @RequirePermission(Resource.parcel, Action.read, { idOf: Resource.block })
  @ApiOperation({ summary: 'List the parcels a block contains' })
  @ApiOkResponse({ type: ParcelResponseDto, isArray: true })
  async listParcels(@Param('id', ParseUUIDPipe) id: string): Promise<ParcelResponseDto[]> {
    const block = await this.queryBus.execute<ListBlockParcelsQuery, Block>(new ListBlockParcelsQuery(id));
    return (block.parcels ?? []).map(ParcelResponseDto.from);
  }
}
