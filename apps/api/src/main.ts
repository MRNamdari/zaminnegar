import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import type { EnvironmentVariables } from './config/environment-variables';
import { buildOpenApiDocument } from './openapi/build-openapi-document';

/** Boots the HTTP server and serves Swagger UI at `/docs`. */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<EnvironmentVariables, true>>(ConfigService);

  configureApp(app);
  app.enableCors({ origin: config.get('CORS_ORIGINS', { infer: true }).split(',').map((origin) => origin.trim()) });
  app.enableShutdownHooks();

  SwaggerModule.setup('docs', app, buildOpenApiDocument(app), { jsonDocumentUrl: 'docs/openapi.json' });

  const port = config.get('PORT', { infer: true });
  await app.listen(port);
  console.log(`API listening on http://localhost:${port} — docs at http://localhost:${port}/docs`);
}

void bootstrap();
