/**
 * Generates a migration for every difference between the entities and the database, with no path to type:
 *
 *   pnpm --filter @zaminnegar/api migration:generate              -> <timestamp>-Auto.ts
 *   pnpm --filter @zaminnegar/api migration:generate AddOwnerPhone -> <timestamp>-AddOwnerPhone.ts
 *
 * Extra flags go after the name and are passed to the TypeORM CLI (e.g. --dr to preview only).
 * Variables from apps/api/.env are loaded when that file exists.
 */
const { spawnSync } = require('node:child_process');
const { existsSync } = require('node:fs');
const path = require('node:path');

const args = process.argv.slice(2);
const hasName = args.length > 0 && !args[0].startsWith('-');
const name = (hasName ? args[0] : 'Auto').replace(/[^A-Za-z0-9_]/g, '');
const extraArgs = hasName ? args.slice(1) : args;

const cli = path.join(path.dirname(require.resolve('typeorm')), 'cli-ts-node-commonjs.js');
const nodeArgs = [];
if (existsSync('.env')) nodeArgs.push('--env-file=.env');

const result = spawnSync(
  process.execPath,
  [
    ...nodeArgs,
    cli,
    'migration:generate',
    '-d',
    'src/database/data-source.ts',
    '-p',
    `src/database/migrations/${name || 'Auto'}`,
    ...extraArgs,
  ],
  { stdio: 'inherit' },
);

process.exit(result.status ?? 1);
