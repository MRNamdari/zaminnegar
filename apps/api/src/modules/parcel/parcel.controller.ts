import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActiveProjectId, ApiSessionAuth, ProjectScope, RequirePermission } from '../access/decorators/access.decorators';
import { ApiErrorResponse } from '../access/decorators/api-error-responses.decorator';
import { Action, Resource } from '../access/permissions';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginatedResult } from '../../common/utils/paginate';
import { AssignOwnerCommand } from './commands/assign-owner.command';
import { CreateParcelCommand, CreateParcelInput } from './commands/create-parcel.command';
import { DeleteParcelCommand } from './commands/delete-parcel.command';
import { RemoveOwnerCommand } from './commands/remove-owner.command';
import { UpdateOwnershipCommand } from './commands/update-ownership.command';
import { UpdateParcelCommand } from './commands/update-parcel.command';
import { AssignOwnerDto } from './dto/assign-owner.dto';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { OwnershipResponseDto } from './dto/ownership-response.dto';
import { OwnershipWithOwnerResponseDto } from './dto/ownership-with-owner-response.dto';
import { ParcelDetailResponseDto } from './dto/parcel-detail-response.dto';
import { ParcelQueryDto } from './dto/parcel-query.dto';
import { ParcelResponseDto } from './dto/parcel-response.dto';
import { UpdateOwnershipDto } from './dto/update-ownership.dto';
import { UpdateParcelDto } from './dto/update-parcel.dto';
import { ParcelOwnership } from './entities/parcel-ownership.entity';
import { Parcel } from './entities/parcel.entity';
import { GetParcelDetailQuery } from './queries/get-parcel-detail.query';
import { GetParcelQuery } from './queries/get-parcel.query';
import { ListParcelOwnershipsQuery } from './queries/list-parcel-ownerships.query';
import { ListParcelsQuery } from './queries/list-parcels.query';

@ApiTags('parcels')
@ApiSessionAuth()
@Controller('parcels')
export class ParcelController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequirePermission(Resource.parcel, Action.create, { scope: 'active' })
  @ApiOperation({
    summary: 'Create a parcel',
    description:
      'Send geometry, or the boundaryId of a finished draft. Region and block are not sent: they are the region and block that contain the parcel outline.',
  })
  @ApiCreatedResponse({ type: ParcelResponseDto })
  @ApiErrorResponse(409, 'No active project selected (`NO_ACTIVE_PROJECT`)')
  async create(@Body() dto: CreateParcelDto, @ActiveProjectId() projectId: string): Promise<ParcelResponseDto> {
    const parcel = await this.commandBus.execute<CreateParcelCommand, Parcel>(
      new CreateParcelCommand({ ...dto, projectId } as CreateParcelInput),
    );
    return ParcelResponseDto.from(parcel);
  }

  @Get()
  @RequirePermission(Resource.parcel, Action.read, { scope: 'query' })
  @ApiOperation({
    summary: 'List parcels',
    description: 'Each parcel carries its region, its block (or null) and the number of owners holding a share',
  })
  @ApiPaginatedResponse(ParcelResponseDto)
  async list(
    @Query() query: ParcelQueryDto,
    @ProjectScope() projectScope: string[] | null,
  ): Promise<PaginatedResponseDto<ParcelResponseDto>> {
    const result = await this.queryBus.execute<ListParcelsQuery, PaginatedResult<Parcel>>(
      new ListParcelsQuery(query, projectScope),
    );
    return PaginatedResponseDto.of(result, ParcelResponseDto.from);
  }

  @Get(':id')
  @RequirePermission(Resource.parcel, Action.read)
  @ApiOperation({ summary: 'Get a parcel by id' })
  @ApiOkResponse({ type: ParcelResponseDto })
  async get(@Param('id', ParseUUIDPipe) id: string): Promise<ParcelResponseDto> {
    const parcel = await this.queryBus.execute<GetParcelQuery, Parcel>(new GetParcelQuery(id));
    return ParcelResponseDto.from(parcel);
  }

  @Get(':id/detail')
  @RequirePermission(Resource.parcel, Action.read)
  @ApiOperation({ summary: 'Get a parcel with project, region, block, boundary and ownerships (with owners)' })
  @ApiOkResponse({ type: ParcelDetailResponseDto })
  async getDetail(@Param('id', ParseUUIDPipe) id: string): Promise<ParcelDetailResponseDto> {
    const parcel = await this.queryBus.execute<GetParcelDetailQuery, Parcel>(new GetParcelDetailQuery(id));
    return ParcelDetailResponseDto.from(parcel);
  }

  @Patch(':id')
  @RequirePermission(Resource.parcel, Action.update)
  @ApiOperation({ summary: 'Update a parcel' })
  @ApiOkResponse({ type: ParcelResponseDto })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateParcelDto): Promise<ParcelResponseDto> {
    const parcel = await this.commandBus.execute<UpdateParcelCommand, Parcel>(new UpdateParcelCommand(id, dto));
    return ParcelResponseDto.from(parcel);
  }

  @Delete(':id')
  @RequirePermission(Resource.parcel, Action.delete)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a parcel together with its ownerships and boundary' })
  @ApiNoContentResponse()
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.commandBus.execute<DeleteParcelCommand, void>(new DeleteParcelCommand(id));
  }

  @Get(':id/owners')
  @RequirePermission(Resource.ownership, Action.read, { idOf: Resource.parcel })
  @ApiOperation({ summary: 'List the owners of a parcel with their shares' })
  @ApiOkResponse({ type: OwnershipWithOwnerResponseDto, isArray: true })
  async listOwners(@Param('id', ParseUUIDPipe) id: string): Promise<OwnershipWithOwnerResponseDto[]> {
    const ownerships = await this.queryBus.execute<ListParcelOwnershipsQuery, ParcelOwnership[]>(
      new ListParcelOwnershipsQuery(id),
    );
    return ownerships.map(OwnershipWithOwnerResponseDto.from);
  }

  @Post(':id/owners')
  @RequirePermission(Resource.ownership, Action.create, { idOf: Resource.parcel })
  @ApiOperation({ summary: 'Give an owner a share of a parcel' })
  @ApiCreatedResponse({ type: OwnershipResponseDto })
  async assignOwner(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignOwnerDto,
  ): Promise<OwnershipResponseDto> {
    const ownership = await this.commandBus.execute<AssignOwnerCommand, ParcelOwnership>(
      new AssignOwnerCommand(id, dto),
    );
    return OwnershipResponseDto.from(ownership);
  }

  @Patch(':id/owners/:ownerId')
  @RequirePermission(Resource.ownership, Action.update, { idOf: Resource.parcel })
  @ApiOperation({ summary: "Change an owner's share of a parcel" })
  @ApiOkResponse({ type: OwnershipResponseDto })
  async updateOwnership(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('ownerId', ParseUUIDPipe) ownerId: string,
    @Body() dto: UpdateOwnershipDto,
  ): Promise<OwnershipResponseDto> {
    const ownership = await this.commandBus.execute<UpdateOwnershipCommand, ParcelOwnership>(
      new UpdateOwnershipCommand(id, ownerId, dto),
    );
    return OwnershipResponseDto.from(ownership);
  }

  @Delete(':id/owners/:ownerId')
  @RequirePermission(Resource.ownership, Action.delete, { idOf: Resource.parcel })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove an owner's share from a parcel" })
  @ApiNoContentResponse()
  async removeOwner(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('ownerId', ParseUUIDPipe) ownerId: string,
  ): Promise<void> {
    await this.commandBus.execute<RemoveOwnerCommand, void>(new RemoveOwnerCommand(id, ownerId));
  }
}
