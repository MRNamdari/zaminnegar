import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';
import { ApiUuidParam } from '../../common/decorators/api-uuid-param.decorator';
import { CreateOwnerCommand } from './commands/create-owner/create-owner.command';
import { DeleteOwnerCommand } from './commands/delete-owner/delete-owner.command';
import { UpdateOwnerCommand } from './commands/update-owner/update-owner.command';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { ListOwnerParcelsQueryDto } from './dto/list-owner-parcels-query.dto';
import { ListOwnersQueryDto } from './dto/list-owners-query.dto';
import { OwnerDto } from './dto/owner.dto';
import { OwnerListDto } from './dto/owner-list.dto';
import { ParcelOwnerDto } from './dto/parcel-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { GetOwnerQuery } from './queries/get-owner/get-owner.query';
import { ListOwnerParcelsQuery } from './queries/list-owner-parcels/list-owner-parcels.query';
import { ListOwnersQuery } from './queries/list-owners/list-owners.query';

/** REST endpoints for owners: `/api/v1/owners`. */
@Controller({ path: 'owners', version: '1' })
export class OwnersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an owner' })
  @ApiCreatedResponse({ description: 'The created owner.', type: OwnerDto })
  @ApiConflictResponse({ description: 'An owner with this name already exists.' })
  @ApiErrorResponses(400, 409)
  async create(@Body() body: CreateOwnerDto): Promise<OwnerDto> {
    const owner = await this.commandBus.execute(new CreateOwnerCommand(body.name, body.phone ?? null, body.email ?? null, body.notes ?? null));
    return OwnerDto.fromOwner(owner);
  }

  @Get()
  @ApiOperation({ summary: 'List owners' })
  @ApiOkResponse({ description: 'One page of owners.', type: OwnerListDto })
  @ApiErrorResponses(400)
  async list(@Query() query: ListOwnersQueryDto): Promise<OwnerListDto> {
    const { items, total } = await this.queryBus.execute(new ListOwnersQuery(query.limit, query.offset));
    return { items: items.map(OwnerDto.fromOwner), total, limit: query.limit, offset: query.offset };
  }

  @Get(':ownerId')
  @ApiOperation({ summary: 'Get an owner' })
  @ApiUuidParam('ownerId', 'Owner id.', 'b6f0f4b9-b615-4d33-a4d2-70fb4f37af2a')
  @ApiOkResponse({ description: 'The owner.', type: OwnerDto })
  @ApiErrorResponses(400, 404)
  async get(@Param('ownerId', ParseUUIDPipe) ownerId: string): Promise<OwnerDto> {
    return OwnerDto.fromOwner(await this.queryBus.execute(new GetOwnerQuery(ownerId)));
  }

  @Get(':ownerId/parcels')
  @ApiOperation({ summary: 'List parcels assigned to an owner' })
  @ApiUuidParam('ownerId', 'Owner id.', 'b6f0f4b9-b615-4d33-a4d2-70fb4f37af2a')
  @ApiOkResponse({ description: 'A paginated list of parcel ownership links for the owner.', type: Object })
  @ApiErrorResponses(400, 404)
  async listParcels(
    @Param('ownerId', ParseUUIDPipe) ownerId: string,
    @Query() query: ListOwnerParcelsQueryDto,
  ) {
    const { items, total } = await this.queryBus.execute(new ListOwnerParcelsQuery(ownerId, query.limit, query.offset));
    return {
      items: items.map((parcelOwner) => ParcelOwnerDto.fromParcelOwner(parcelOwner)),
      total,
      limit: query.limit,
      offset: query.offset,
    };
  }

  @Patch(':ownerId')
  @ApiOperation({ summary: 'Update an owner' })
  @ApiUuidParam('ownerId', 'Owner id.', 'b6f0f4b9-b615-4d33-a4d2-70fb4f37af2a')
  @ApiOkResponse({ description: 'The updated owner.', type: OwnerDto })
  @ApiConflictResponse({ description: 'Another owner already uses this name.' })
  @ApiErrorResponses(400, 404, 409)
  async update(
    @Param('ownerId', ParseUUIDPipe) ownerId: string,
    @Body() body: UpdateOwnerDto,
  ): Promise<OwnerDto> {
    return OwnerDto.fromOwner(await this.commandBus.execute(new UpdateOwnerCommand(ownerId, body)));
  }

  @Delete(':ownerId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an owner' })
  @ApiUuidParam('ownerId', 'Owner id.', 'b6f0f4b9-b615-4d33-a4d2-70fb4f37af2a')
  @ApiErrorResponses(400, 404)
  async remove(@Param('ownerId', ParseUUIDPipe) ownerId: string): Promise<void> {
    await this.commandBus.execute(new DeleteOwnerCommand(ownerId));
  }
}
