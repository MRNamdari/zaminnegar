import { defineConfig } from 'typed-openapi';

export default defineConfig({
  input: './openapi.json',
  output: './src/generated/client.ts',
  defaultFetcher: true,
  coerce: true,
  format: true,
  includeClient: true,
  includeDescriptions: true,
  jsdoc: true,
  transformDates: true,
  validateSide: 'both',
  treeShakeSchemas: true,
  tanstack: 'tanstack.ts',
  runtime: 'zod',
  validation: 'strict',
});
