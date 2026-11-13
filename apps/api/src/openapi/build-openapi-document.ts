import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { SESSION_AUTH_NAME } from '../modules/access/decorators/access.decorators';

/**
 * Cookie name shown in the document. The real name is configurable (SESSION_COOKIE_NAME); the cookie is set by
 * the server and sent by the browser, so clients never handle it by name.
 */
const DOCUMENTED_COOKIE_NAME = 'sid';

/** Swagger UI options shared by the server. */
export const SWAGGER_UI_OPTIONS = {
  swaggerOptions: { persistAuthorization: true },
};

/** Builds the OpenAPI 3 document describing every controller of the application. */
export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Zaminnegar API')
    .setDescription(
      'Farmland management API. Geometry is GeoJSON in WGS 84 (EPSG:4326) with `[longitude, latitude]` ordering. ' +
        'Errors raised by the application share one envelope (`ErrorResponseDto`); request validation errors use ' +
        '`ValidationErrorResponseDto`.\n\n' +
        '**Authentication.** Register with `POST /auth/register` and confirm the phone with `POST /auth/register/verify`, ' +
        'then `POST /auth/login` with username and password. The server answers with an HTTP-only session cookie, which ' +
        'the browser sends on every later request (the session identifier never appears in a response body). A user has ' +
        'one session at a time; it ends after an idle period or an absolute deadline. A missing, invalid or expired ' +
        'session gives `401`; a valid session without the required permission gives `403`.\n\n' +
        '**Authorization.** Permissions come from roles stored in the database: a *system role* (held once, applies ' +
        'to every project) and one *project role* per project membership (applies to that project only; custom roles ' +
        'belong to a single project). A project or record you have no relationship with answers `404`.',
    )
    .setVersion('1.0.0')
    .addCookieAuth(
      DOCUMENTED_COOKIE_NAME,
      {
        type: 'apiKey',
        in: 'cookie',
        description:
          'HTTP-only session cookie set by `POST /auth/login`. Ended by `POST /auth/logout`, a password reset or deactivation.',
      },
      SESSION_AUTH_NAME,
    )
    .addTag(
      'auth',
      'Registration, sign in / out, password reset and the current session. The registration, login and password routes are public.',
    )
    .addTag(
      'users',
      'Account administration (system-level `user:*` permissions); every user can read their own account.',
    )
    .addTag('roles', 'Permission catalogue, predefined system roles, and the roles of a project (predefined and custom).')
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
