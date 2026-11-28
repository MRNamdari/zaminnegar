import 'reflect-metadata';
import fastifyCookie from '@fastify/cookie';
import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {
  buildOpenApiDocument,
  SWAGGER_UI_OPTIONS,
} from './openapi/build-openapi-document';
import { TileExceptionFilter } from './common/filters/tile-exception.filter';

/** Express parsed JSON and urlencoded bodies up to `100kb`; Fastify's own default is 1 MiB. Keep the old limit. */
const BODY_LIMIT_BYTES = 100 * 1024;

/**
 * Same meaning as before: digits = number of trusted proxy hops, `true` = trust every proxy, anything else (or unset)
 * = trust none. Fastify's `trustProxy` uses the same `proxy-addr` rules as Express's `trust proxy`.
 */
function readTrustProxy(raw: string | undefined): boolean {
  if (!raw) return false;
  return /^\d+$/.test(raw) ? Number(raw) >  0 : raw === 'true';
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      // Behind a reverse proxy, set TRUST_PROXY (hop count, or `true`) so `req.ip` is the client, not the proxy:
      // the per-IP OTP limit depends on it. Leave it unset when the app is exposed directly.
      trustProxy: readTrustProxy(process.env.TRUST_PROXY),
      bodyLimit: BODY_LIMIT_BYTES,
    }),
  );

  // Provides `reply.setCookie` / `reply.clearCookie` for the session cookie. Reading it stays manual
  // (SessionCookieService), and no signing secret is configured: the session token is an opaque database lookup key.
  await app.register(fastifyCookie);

  // `transform` is required: it applies the pagination defaults and turns page/limit into numbers.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableShutdownHooks();
  app.useGlobalFilters(new TileExceptionFilter(app.get(HttpAdapterHost)));
  // Same document the client generator uses, so /docs and the generated client never disagree.
  SwaggerModule.setup(
    'docs',
    app,
    buildOpenApiDocument(app),
    SWAGGER_UI_OPTIONS,
  );

  // Fastify listens on 127.0.0.1 unless told otherwise (Express listened on all interfaces), so bind explicitly.
  await app.listen(process.env.PORT ?? 3000, process.env.HOST ?? '0.0.0.0');
}

void bootstrap();
