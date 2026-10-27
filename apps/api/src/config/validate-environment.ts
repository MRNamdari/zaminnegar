import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { EnvironmentVariables } from './environment-variables';

/**
 * Validates and coerces raw environment values. Used by `ConfigModule` at boot
 * and by the TypeORM CLI data source, so both always agree.
 *
 * @throws Error listing every invalid variable.
 */
export function validateEnvironment(raw: Record<string, unknown>): EnvironmentVariables {
  const config = plainToInstance(EnvironmentVariables, raw, { enableImplicitConversion: true });
  const errors = validateSync(config, { skipMissingProperties: false });
  if (errors.length > 0) {
    const lines = errors.map((e) => `${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`);
    throw new Error(`Invalid environment configuration:\n${lines.join('\n')}`);
  }
  return config;
}
