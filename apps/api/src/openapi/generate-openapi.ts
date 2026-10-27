import { NestFactory } from '@nestjs/core';
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { AppModule } from '../app.module';
import { configureApp } from '../app.setup';
import { buildOpenApiDocument } from './build-openapi-document';

/** The workspace root; `nest start openapi` runs inside `apps/api`. */
const WORKSPACE_ROOT = resolve(process.cwd(), '../..');
const OPENAPI_OUTPUT = resolve(WORKSPACE_ROOT, 'packages/api-client/openapi.json');
const API_CLIENT_PACKAGE = '@zaminnegar/api-client';

/**
 * Entry point of the `openapi` Nest project (see `nest-cli.json`):
 * 1. builds the application in preview mode — routes and DTO metadata are
 *    registered but providers are not instantiated, so no database is needed;
 * 2. writes the OpenAPI document to `packages/api-client/openapi.json`;
 * 3. runs the client package's `generate` script, which turns it into TypeScript types.
 */
async function generate(): Promise<void> {
  const app = await NestFactory.create(AppModule, { preview: true, abortOnError: false, logger: ['error', 'warn'] });
  configureApp(app);
  const document = buildOpenApiDocument(app);
  await app.close();

  await mkdir(dirname(OPENAPI_OUTPUT), { recursive: true });
  await writeFile(OPENAPI_OUTPUT, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
  console.log(`OpenAPI document written to ${OPENAPI_OUTPUT}`);

  execFileSync('pnpm', ['--filter', API_CLIENT_PACKAGE, 'generate'], { cwd: WORKSPACE_ROOT, stdio: 'inherit' });
}

generate().catch((error: unknown) => {
  console.error('OpenAPI generation failed:', error);
  process.exit(1);
});
