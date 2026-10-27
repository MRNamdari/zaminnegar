import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';
import { ApiUuidParam } from '../../common/decorators/api-uuid-param.decorator';
import { CreateParcelCommand } from './commands/create-parcel/create-parcel.command';
import { DeleteAllParcelsCommand } from './commands/delete-all-parcels/delete-all-parcels.command';
import { DeleteParcelCommand } from './commands/delete-parcel/delete-parcel.command';
import { UpdateParcelCommand } from './commands/update-parcel/update-parcel.command';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { ParcelDto } from './dto/parcel.dto';
import { UpdateParcelDto } from './dto/update-parcel.dto';
import { GetParcelQuery } from './queries/get-parcel/get-parcel.query';
import { ListParcelsQuery } from './queries/list-parcels/list-parcels.query';

const PROJECT_ID_EXAMPLE = '5f0c8f0e-2d41-4b6a-9d4e-8a1f0c2b7e11';
const PARCEL_ID_EXAMPLE = 'c7a1b2f4-3d56-4e78-9a01-b2c3d4e5f607';

/** REST endpoints for the parcels of a project: `/api/v1/projects/{projectId}/parcels`. */
@ApiTags('Parcels')
@Controller({ path: 'projects/:projectId/parcels', version: '1' })
@ApiUuidParam('projectId', 'Id of the project that owns the parcels.', PROJECT_ID_EXAMPLE)
export class ParcelsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List parcels of a project', description: 'Returns every parcel, oldest first. Geometry is GeoJSON in EPSG:4326.' })
  @ApiOkResponse({ description: 'All parcels of the project.', type: [ParcelDto] })
  @ApiErrorResponses(400, 404)
  async list(@Param('projectId', ParseUUIDPipe) projectId: string): Promise<ParcelDto[]> {
    return (await this.queryBus.execute(new ListParcelsQuery(projectId))).map(ParcelDto.fromParcel);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a parcel',
    description: 'The polygon is validated by PostGIS (`ST_IsValid`); self-intersecting polygons are rejected with 422. The area is computed server-side.',
  })
  @ApiCreatedResponse({ description: 'The created parcel.', type: ParcelDto })
  @ApiConflictResponse({ description: 'A parcel with this name already exists in the project.' })
  @ApiErrorResponses(400, 404, 409, 422)
  async create(@Param('projectId', ParseUUIDPipe) projectId: string, @Body() body: CreateParcelDto): Promise<ParcelDto> {
    return ParcelDto.fromParcel(await this.commandBus.execute(new CreateParcelCommand(projectId, body)));
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete every parcel of a project', description: 'Irreversible. The project itself is kept.' })
  @ApiNoContentResponse({ description: 'All parcels were deleted.' })
  @ApiErrorResponses(400, 404)
  async removeAll(@Param('projectId', ParseUUIDPipe) projectId: string): Promise<void> {
    await this.commandBus.execute(new DeleteAllParcelsCommand(projectId));
  }

  @Get(':parcelId')
  @ApiOperation({ summary: 'Get a parcel' })
  @ApiUuidParam('parcelId', 'Parcel id.', PARCEL_ID_EXAMPLE)
  @ApiOkResponse({ description: 'The parcel.', type: ParcelDto })
  @ApiErrorResponses(400, 404)
  async get(@Param('projectId', ParseUUIDPipe) projectId: string, @Param('parcelId', ParseUUIDPipe) parcelId: string): Promise<ParcelDto> {
    return ParcelDto.fromParcel(await this.queryBus.execute(new GetParcelQuery(projectId, parcelId)));
  }

  @Patch(':parcelId')
  @ApiOperation({
    summary: 'Update a parcel',
    description: 'Send only the fields to change. Sending `geometry` re-validates the polygon and recomputes the area.',
  })
  @ApiUuidParam('parcelId', 'Parcel id.', PARCEL_ID_EXAMPLE)
  @ApiOkResponse({ description: 'The updated parcel.', type: ParcelDto })
  @ApiConflictResponse({ description: 'Another parcel of the project already uses this name.' })
  @ApiErrorResponses(400, 404, 409, 422)
  async update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('parcelId', ParseUUIDPipe) parcelId: string,
    @Body() body: UpdateParcelDto,
  ): Promise<ParcelDto> {
    return ParcelDto.fromParcel(await this.commandBus.execute(new UpdateParcelCommand(projectId, parcelId, body)));
  }

  @Delete(':parcelId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a parcel' })
  @ApiUuidParam('parcelId', 'Parcel id.', PARCEL_ID_EXAMPLE)
  @ApiNoContentResponse({ description: 'The parcel was deleted.' })
  @ApiErrorResponses(400, 404)
  async remove(@Param('projectId', ParseUUIDPipe) projectId: string, @Param('parcelId', ParseUUIDPipe) parcelId: string): Promise<void> {
    await this.commandBus.execute(new DeleteParcelCommand(projectId, parcelId));
  }
}
