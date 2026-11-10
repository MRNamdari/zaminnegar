import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginatedResult } from '../../common/utils/paginate';
import { CreateBlockCommand, CreateBlockInput } from './commands/create-block.command';
import { DeleteBlockCommand } from './commands/delete-block.command';
import { UpdateBlockCommand } from './commands/update-block.command';
import { CreateBlockDto } from './dto/create-block.dto';
import { BlockQueryDto } from './dto/block-query.dto';
import { BlockResponseDto } from './dto/block-response.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { Block } from './entities/block.entity';
import { GetBlockQuery } from './queries/get-block.query';
import { ListBlocksQuery } from './queries/list-blocks.query';
import { BlockWithParcelsResponse } from './dto/block-whith-parcels-response.dto';
import { Parcel } from '../parcel/entities/parcel.entity';
import { ListBlockParcelsQuery } from '../parcel/queries/list-block-parcels.query';

@ApiTags('blocks')
@Controller('blocks')
export class BlockController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a block',
    description: 'Send geometry, or the boundaryId of a finished draft',
  })
  @ApiCreatedResponse({ type: BlockResponseDto })
  async create(@Body() dto: CreateBlockDto): Promise<BlockResponseDto> {
    const entity = await this.commandBus.execute<CreateBlockCommand, Block>(
      new CreateBlockCommand(dto as CreateBlockInput),
    );
    return BlockResponseDto.from(entity);
  }

  @Get()
  @ApiOperation({ summary: 'List blocks' })
  @ApiPaginatedResponse(BlockResponseDto)
  async list(
    @Query() query: BlockQueryDto,
  ): Promise<PaginatedResponseDto<BlockResponseDto>> {
    const result = await this.queryBus.execute<
      ListBlocksQuery,
      PaginatedResult<Block>
    >(new ListBlocksQuery(query));
    return PaginatedResponseDto.of(result, BlockResponseDto.from);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a block by id' })
  @ApiOkResponse({ type: BlockResponseDto })
  async get(@Param('id', ParseUUIDPipe) id: string): Promise<BlockResponseDto> {
    const entity = await this.queryBus.execute<GetBlockQuery, Block>(
      new GetBlockQuery(id),
    );
    return BlockResponseDto.from(entity);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a block' })
  @ApiOkResponse({ type: BlockResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBlockDto,
  ): Promise<BlockResponseDto> {
    const entity = await this.commandBus.execute<UpdateBlockCommand, Block>(
      new UpdateBlockCommand(id, dto),
    );
    return BlockResponseDto.from(entity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a block' })
  @ApiNoContentResponse()
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.commandBus.execute<DeleteBlockCommand, void>(
      new DeleteBlockCommand(id),
    );
  }

  @Get(':id/parcels')
  @ApiOperation({ summary: 'List the parcels a block contains' })
  @ApiOkResponse({ type: BlockWithParcelsResponse, isArray: true })
  async listParcels(@Param('id', ParseUUIDPipe) id: string): Promise<Parcel[]> {
    const block = await this.queryBus.execute<ListBlockParcelsQuery, Block>(
      new ListBlockParcelsQuery(id),
    );
    return block.parcels ?? [];
  }
}
