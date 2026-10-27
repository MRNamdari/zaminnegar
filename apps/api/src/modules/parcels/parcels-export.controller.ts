import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';
import { ApiUuidParam } from '../../common/decorators/api-uuid-param.decorator';
import { ParcelFeatureCollectionDto } from './dto/parcel-feature-collection.dto';
import { ListParcelsQuery } from './queries/list-parcels/list-parcels.query';

/** Export endpoints for a project: `/api/v1/projects/{projectId}/exports`. */
@ApiTags('Exports')
@Controller({ path: 'projects/:projectId/exports', version: '1' })
export class ParcelsExportController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('geojson')
  @ApiOperation({
    summary: 'Export parcels as GeoJSON',
    description: 'RFC 7946 FeatureCollection in WGS 84 with `[longitude, latitude]` coordinates. Each feature carries the parcel styling and area.',
  })
  @ApiUuidParam('projectId', 'Project id.', '5f0c8f0e-2d41-4b6a-9d4e-8a1f0c2b7e11')
  @ApiOkResponse({ description: 'The FeatureCollection.', type: ParcelFeatureCollectionDto })
  @ApiErrorResponses(400, 404)
  async geoJson(@Param('projectId', ParseUUIDPipe) projectId: string): Promise<ParcelFeatureCollectionDto> {
    return ParcelFeatureCollectionDto.fromParcels(await this.queryBus.execute(new ListParcelsQuery(projectId)));
  }
}
