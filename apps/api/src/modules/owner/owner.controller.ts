import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiSessionAuth, ProjectScope, RequirePermission } from '../access/decorators/access.decorators';
import { Action, Resource } from '../access/permissions';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginatedResult } from '../../common/utils/paginate';
import { CreateOwnerCommand } from './commands/create-owner.command';
import { DeleteOwnerCommand } from './commands/delete-owner.command';
import { UpdateOwnerCommand } from './commands/update-owner.command';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { OwnerQueryDto } from './dto/owner-query.dto';
import { OwnerResponseDto } from './dto/owner-response.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { Owner } from './entities/owner.entity';
import { GetOwnerQuery } from './queries/get-owner.query';
import { ListOwnersQuery } from './queries/list-owners.query';
import { ListOwnerParcelsQuery } from '../parcel/queries/list-owner-parcels.query';
import { ParcelOwnership } from '../parcel/entities/parcel-ownership.entity';
import { OwnershipWithParcelResponseDto } from '../parcel/dto/ownership-with-parcel-response.dto';

@ApiTags('owners')
@ApiSessionAuth()
@Controller('owners')
export class OwnerController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequirePermission(Resource.owner, Action.create, { scope: 'body' })
  @ApiOperation({ summary: 'Create a owner' })
  @ApiCreatedResponse({ type: OwnerResponseDto })
  async create(@Body() dto: CreateOwnerDto): Promise<OwnerResponseDto> {
    const entity = await this.commandBus.execute<CreateOwnerCommand, Owner>(new CreateOwnerCommand(dto));
    return OwnerResponseDto.from(entity);
  }

  @Get()
  @RequirePermission(Resource.owner, Action.read, { scope: 'query' })
  @ApiOperation({ summary: 'List owners' })
  @ApiPaginatedResponse(OwnerResponseDto)
  async list(@Query() query: OwnerQueryDto, @ProjectScope() projectScope: string[] | null): Promise<PaginatedResponseDto<OwnerResponseDto>> {
    const result = await this.queryBus.execute<ListOwnersQuery, PaginatedResult<Owner>>(new ListOwnersQuery(query, projectScope));
    return PaginatedResponseDto.of(result, OwnerResponseDto.from);
  }

  @Get(':id')
  @RequirePermission(Resource.owner, Action.read)
  @ApiOperation({ summary: 'Get a owner by id' })
  @ApiOkResponse({ type: OwnerResponseDto })
  async get(@Param('id', ParseUUIDPipe) id: string): Promise<OwnerResponseDto> {
    const entity = await this.queryBus.execute<GetOwnerQuery, Owner>(new GetOwnerQuery(id));
    return OwnerResponseDto.from(entity);
  }

  @Patch(':id')
  @RequirePermission(Resource.owner, Action.update)
  @ApiOperation({ summary: 'Update a owner' })
  @ApiOkResponse({ type: OwnerResponseDto })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateOwnerDto): Promise<OwnerResponseDto> {
    const entity = await this.commandBus.execute<UpdateOwnerCommand, Owner>(new UpdateOwnerCommand(id, dto));
    return OwnerResponseDto.from(entity);
  }

  @Delete(':id')
  @RequirePermission(Resource.owner, Action.delete)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a owner' })
  @ApiNoContentResponse()
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.commandBus.execute<DeleteOwnerCommand, void>(new DeleteOwnerCommand(id));
  }

  @Get(':id/parcels')
  @RequirePermission(Resource.ownership, Action.read, { idOf: Resource.owner })
  @ApiOperation({ summary: 'List the parcels an owner holds shares in, with the share of each' })
  @ApiOkResponse({ type: OwnershipWithParcelResponseDto, isArray: true })
  async listParcels(@Param('id', ParseUUIDPipe) id: string): Promise<OwnershipWithParcelResponseDto[]> {
    const ownerships = await this.queryBus.execute<ListOwnerParcelsQuery, ParcelOwnership[]>(
      new ListOwnerParcelsQuery(id),
    );
    return ownerships.map(OwnershipWithParcelResponseDto.from);
  }
}
