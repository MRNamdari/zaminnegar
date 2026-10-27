import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

/** Builds the OpenAPI 3 document describing every controller of the application. */
export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Zaminnegar API')
    .setDescription(
      'Farmland management API. Geometry is GeoJSON in WGS 84 (EPSG:4326) with `[longitude, latitude]` ordering. ' +
        'Errors share one envelope (`ErrorResponseDto`).',
    )
    .setVersion('1.0.0')
    .addTag('Projects', 'Groups of parcels, e.g. one farm or survey.')
    .addTag('Parcels', 'Land parcels with PostGIS-validated boundaries.')
    .addTag('Exports', 'Download project data in standard formats.')
    .build();
  return SwaggerModule.createDocument(app, config);
}
