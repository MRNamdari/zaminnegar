import { QueryFailedError } from 'typeorm';
import type { AppError } from '../errors/app.error';
import { PostgresErrorCode } from './postgres-error-code.enum';

/** Maps a constraint name (declared explicitly on the entity) to the error it represents. */
export type ConstraintErrorMap = Readonly<Record<string, () => AppError>>;

const HANDLED_CODES: ReadonlySet<string> = new Set(Object.values(PostgresErrorCode));

/**
 * Translates a PostgreSQL constraint violation into a domain {@link AppError}.
 * Because every constraint has an explicit name, no error-message parsing is needed.
 * Unknown errors are re-thrown untouched.
 *
 * @example
 * try { await repo.insert(row); }
 * catch (error) { handleDatabaseError(error, { [PROJECT_CONSTRAINTS.uniqueName]: () => new ProjectNameAlreadyExistsError(name) }); }
 */
export function handleDatabaseError(error: unknown, mappings: ConstraintErrorMap): never {
  if (error instanceof QueryFailedError) {
    const { code, constraint } = error.driverError as { code?: string; constraint?: string };
    if (code && HANDLED_CODES.has(code) && constraint && mappings[constraint]) {
      throw mappings[constraint]();
    }
  }
  throw error;
}
