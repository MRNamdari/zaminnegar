import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {
  buildOpenApiDocument,
  SWAGGER_UI_OPTIONS,
} from './openapi/build-openapi-document';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

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

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
