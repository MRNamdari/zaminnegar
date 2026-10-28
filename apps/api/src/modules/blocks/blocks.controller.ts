import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';
import { ApiUuidParam } from '../../common/decorators/api-uuid-param.decorator';
import { CreateBlockDto } from './dto/create-block.dto';
import { BlockDto } from './dto/block.dto';
import { BlockListDto } from './dto/block-list.dto';
import { ListBlocksQueryDto } from './dto/list-blocks-query.dto';
import { CreateBlockCommand } from './commands/create-block/create-block.command';
import { GetBlockQuery } from './queries/get-block/get-block.query';
import { ListBlocksQuery } from './queries/list-blocks/list-blocks.query';

/** REST endpoints for blocks: `/api/v1/regions/{regionId}/blocks`. */
@Controller({ path: 'regions/:regionId/blocks', version: '1' })
export class BlocksController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a block', description: 'Block names are unique inside a region.' })
  @ApiCreatedResponse({ description: 'The created block.', type: BlockDto })
  @ApiConflictResponse({ description: 'A block with this name already exists in the region.' })
  @ApiErrorResponses(400, 409)
  async create(@Param('regionId', ParseUUIDPipe) regionId: string, @Body() body: CreateBlockDto): Promise<BlockDto> {
    const block = await this.commandBus.execute(new CreateBlockCommand(regionId, body.name, body.description));
    return BlockDto.fromBlock(block as any);
  }

  @Get()
  @ApiOperation({ summary: 'List blocks in a region' })
  @ApiOkResponse({ description: 'One page of blocks.', type: BlockListDto })
  @ApiErrorResponses(400)
  async list(@Param('regionId', ParseUUIDPipe) regionId: string, @Query() query: ListBlocksQueryDto): Promise<BlockListDto> {
    const { items, total } = await this.queryBus.execute(new ListBlocksQuery(regionId, query.limit, query.offset));
    return { items: items.map((block) => BlockDto.fromBlock(block as any)), total, limit: query.limit, offset: query.offset };
  }

  @Get(':blockId')
  @ApiOperation({ summary: 'Get a block' })
  @ApiUuidParam('regionId', 'Region id.', '5f0c8f0e-2d41-4b6a-9d4e-8a1f0c2b7e11')
  @ApiUuidParam('blockId', 'Block id.', '4c6e6459-fda9-4c71-bb9c-8bb66efc0701')
  @ApiOkResponse({ description: 'The block.', type: BlockDto })
  @ApiErrorResponses(400, 404)
  async get(
    @Param('regionId', ParseUUIDPipe) regionId: string,
    @Param('blockId', ParseUUIDPipe) blockId: string,
  ): Promise<BlockDto> {
    return BlockDto.fromBlock((await this.queryBus.execute(new GetBlockQuery(regionId, blockId))) as any);
  }
}
