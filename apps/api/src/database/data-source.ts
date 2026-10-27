import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { validateEnvironment } from '../config/validate-environment';
import { createConnectionOptions } from './typeorm-connection';

// `.env` is optional: variables may come from the shell or the CI system.
try {
  process.loadEnvFile();
} catch {
  /* no .env file */
}

/** Data source used only by the TypeORM CLI (`pnpm migration:run`, …). */
export default new DataSource({
  ...createConnectionOptions(validateEnvironment(process.env)),
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
});
