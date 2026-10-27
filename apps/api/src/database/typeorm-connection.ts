import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import type { EnvironmentVariables } from '../config/environment-variables';

/** The subset of environment variables needed to open a database connection. */
export type DatabaseEnvironment = Pick<
  EnvironmentVariables,
  'DB_HOST' | 'DB_PORT' | 'DB_NAME' | 'DB_USER' | 'DB_PASSWORD' | 'DB_LOGGING'
>;

/** Connection settings shared by the application and the TypeORM CLI. */
export function createConnectionOptions(env: DatabaseEnvironment): PostgresConnectionOptions {
  return {
    type: 'postgres',
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    logging: env.DB_LOGGING,
    // The schema is owned by migrations; never let TypeORM alter it.
    synchronize: false,
  };
}
