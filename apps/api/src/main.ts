import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {
  buildOpenApiDocument,
  SWAGGER_UI_OPTIONS,
} from './openapi/build-openapi-document';
import {
  buildOpenApiDocument,
  SWAGGER_UI_OPTIONS,
} from './openapi/build-openapi-document';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Behind a reverse proxy, set TRUST_PROXY (hop count, or `true`) so `req.ip` is the client, not the proxy:
  // the per-IP OTP limit depends on it. Leave it unset when the app is exposed directly.
  const trustProxy = process.env.TRUST_PROXY;
  if (trustProxy)
    app.set(
      'trust proxy',
      /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy === 'true',
    );

  // `transform` is required: it applies the pagination defaults and turns page/limit into numbers.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableShutdownHooks();

  // Same document the client generator uses, so /docs and the generated client never disagree.
  SwaggerModule.setup(
    'docs',
    app,
    buildOpenApiDocument(app),
    SWAGGER_UI_OPTIONS,
  );
  // Same document the client generator uses, so /docs and the generated client never disagree.
  SwaggerModule.setup(
    'docs',
    app,
    buildOpenApiDocument(app),
    SWAGGER_UI_OPTIONS,
  );

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
