import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
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
@Controller('owners')
export class OwnerController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a owner' })
  @ApiCreatedResponse({ type: OwnerResponseDto })
  async create(@Body() dto: CreateOwnerDto): Promise<OwnerResponseDto> {
    const entity = await this.commandBus.execute<CreateOwnerCommand, Owner>(new CreateOwnerCommand(dto));
    return OwnerResponseDto.from(entity);
  }

  @Get()
  @ApiOperation({ summary: 'List owners' })
  @ApiPaginatedResponse(OwnerResponseDto)
  async list(@Query() query: OwnerQueryDto): Promise<PaginatedResponseDto<OwnerResponseDto>> {
    const result = await this.queryBus.execute<ListOwnersQuery, PaginatedResult<Owner>>(new ListOwnersQuery(query));
    return PaginatedResponseDto.of(result, OwnerResponseDto.from);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a owner by id' })
  @ApiOkResponse({ type: OwnerResponseDto })
  async get(@Param('id', ParseUUIDPipe) id: string): Promise<OwnerResponseDto> {
    const entity = await this.queryBus.execute<GetOwnerQuery, Owner>(new GetOwnerQuery(id));
    return OwnerResponseDto.from(entity);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a owner' })
  @ApiOkResponse({ type: OwnerResponseDto })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateOwnerDto): Promise<OwnerResponseDto> {
    const entity = await this.commandBus.execute<UpdateOwnerCommand, Owner>(new UpdateOwnerCommand(id, dto));
    return OwnerResponseDto.from(entity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a owner' })
  @ApiNoContentResponse()
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.commandBus.execute<DeleteOwnerCommand, void>(new DeleteOwnerCommand(id));
  }

  @Get(':id/parcels')
  @ApiOperation({ summary: 'List the parcels an owner holds shares in, with the share of each' })
  @ApiOkResponse({ type: OwnershipWithParcelResponseDto, isArray: true })
  async listParcels(@Param('id', ParseUUIDPipe) id: string): Promise<OwnershipWithParcelResponseDto[]> {
    const ownerships = await this.queryBus.execute<ListOwnerParcelsQuery, ParcelOwnership[]>(
      new ListOwnerParcelsQuery(id),
    );
    return ownerships.map(OwnershipWithParcelResponseDto.from);
  }
}
