import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';
import { ApiUuidParam } from '../../common/decorators/api-uuid-param.decorator';
import { AssignParcelOwnerCommand } from './commands/assign-parcel-owner/assign-parcel-owner.command';
import { RemoveParcelOwnerCommand } from './commands/remove-parcel-owner/remove-parcel-owner.command';
import { CreateParcelOwnerDto } from './dto/create-parcel-owner.dto';
import { ListParcelOwnersQueryDto } from './dto/list-parcel-owners-query.dto';
import { ParcelOwnerDto } from './dto/parcel-owner.dto';
import { ListParcelOwnersQuery } from './queries/list-parcel-owners/list-parcel-owners.query';

/** REST endpoints for parcel-ownership links: `/api/v1/parcels/{parcelId}/owners`. */
@Controller({ path: 'parcels/:parcelId/owners', version: '1' })
export class ParcelOwnersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Attach an owner to a parcel with a share' })
  @ApiCreatedResponse({ description: 'The owner assignment on the parcel.', type: ParcelOwnerDto })
  @ApiConflictResponse({ description: 'The owner is already assigned to this parcel.' })
  @ApiErrorResponses(400, 409, 404)
  async assign(
    @Param('parcelId', ParseUUIDPipe) parcelId: string,
    @Body() body: CreateParcelOwnerDto,
  ): Promise<ParcelOwnerDto> {
    const assignment = await this.commandBus.execute(new AssignParcelOwnerCommand(parcelId, body.ownerId, body.share));
    return ParcelOwnerDto.fromParcelOwner(assignment);
  }

  @Get()
  @ApiOperation({ summary: 'List owners on a parcel' })
  @ApiOkResponse({ description: 'One page of ownership links.', type: [ParcelOwnerDto] })
  @ApiErrorResponses(400)
  async list(
    @Param('parcelId', ParseUUIDPipe) parcelId: string,
    @Query() query: ListParcelOwnersQueryDto,
  ) {
    const { items, total } = await this.queryBus.execute(new ListParcelOwnersQuery(parcelId, query.limit, query.offset));
    return { items: items.map(ParcelOwnerDto.fromParcelOwner), total, limit: query.limit, offset: query.offset };
  }

  @Delete(':ownerId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove an owner from a parcel' })
  @ApiUuidParam('parcelId', 'Parcel id.', '5f0c8f0e-2d41-4b6a-9d4e-8a1f0c2b7e11')
  @ApiUuidParam('ownerId', 'Owner id.', 'b6f0f4b9-b615-4d33-a4d2-70fb4f37af2a')
  @ApiErrorResponses(400, 404)
  async remove(
    @Param('parcelId', ParseUUIDPipe) parcelId: string,
    @Param('ownerId', ParseUUIDPipe) ownerId: string,
  ): Promise<void> {
    await this.commandBus.execute(new RemoveParcelOwnerCommand(parcelId, ownerId));
  }
}
