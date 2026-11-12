import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

/**
 * Name of the security scheme. `@ApiBearerAuth()` (no argument) refers to this exact name, so every
 * controller that carries it shows up as protected and gets the "Authorize" button in Swagger UI.
 */
export const BEARER_AUTH_NAME = 'bearer';

/** Swagger UI options shared by the server: keep the entered token across page reloads. */
export const SWAGGER_UI_OPTIONS = {
  swaggerOptions: { persistAuthorization: true },
};

/** Builds the OpenAPI 3 document describing every controller of the application. */
export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Zaminnegar API')
    .setDescription(
      'Farmland management API. Geometry is GeoJSON in WGS 84 (EPSG:4326) with `[longitude, latitude]` ordering. ' +
        'Errors share one envelope (`ErrorResponseDto`).\n\n' +
        '**Authentication.** Call `POST /auth/login` with email and password to get a session token, then send it ' +
        'as `Authorization: Bearer <token>` on every other request (use the *Authorize* button here). ' +
        'A missing, invalid or expired token gives `401`; a valid token without the required permission on the ' +
        'project in question gives `403`. Permissions come from roles stored in the database and are granted ' +
        'either globally (global role) or per project (project membership).',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'Opaque session token',
        description:
          'The `token` returned by `POST /auth/login`. Revoked by `POST /auth/logout`.',
      },
      BEARER_AUTH_NAME,
    )
    .addTag(
      'auth',
      'Sign in / out and inspect the current session. `login` is the only public route.',
    )
    .addTag(
      'users',
      'User administration (global `user:*` permissions, i.e. admin).',
    )
    .addTag('roles', 'Roles and their permissions, stored in the database.')
    .addTag(
      'project-members',
      'Which users act in a project, and with which role.',
    )
    .addTag(
      'projects',
      'Groups of regions, blocks, parcels and owners, e.g. one farm or survey.',
    )
    .addTag(
      'boundaries',
      'Polygon outlines; drafts become region, block or parcel outlines.',
    )
    .addTag('regions', 'Territories; contain blocks and parcels.')
    .addTag(
      'blocks',
      'Groups of parcels inside a region. The region is derived from the outline.',
    )
    .addTag(
      'parcels',
      'Land parcels. Region and block are derived from the outline.',
    )
    .addTag('owners', 'People or organizations holding shares in parcels.')
    .build();
  return SwaggerModule.createDocument(app, config);
}
