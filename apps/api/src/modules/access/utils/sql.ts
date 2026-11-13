import type { EntityManager } from 'typeorm';

/** Anything with TypeORM's `query`: an `EntityManager` (also inside a transaction) or the `DataSource`. */
export type Queryable = Pick<EntityManager, 'query'>;

/** Runs a statement that returns rows (SELECT, or INSERT ... RETURNING). For UPDATE/DELETE see `execute` and `returning`. */
export async function rows<T>(db: Queryable, sql: string, params: readonly unknown[] = []): Promise<T[]> {
  return (await db.query(sql, [...params])) as T[];
}

export async function firstRow<T>(db: Queryable, sql: string, params: readonly unknown[] = []): Promise<T | undefined> {
  return (await rows<T>(db, sql, params))[0];
}

/**
 * Runs an UPDATE or DELETE and returns the affected row count. For these statements TypeORM's raw result is
 * `[rows, affectedCount]`.
 */
export async function execute(db: Queryable, sql: string, params: readonly unknown[] = []): Promise<number> {
  const result = (await db.query(sql, [...params])) as [unknown[], number];
  return result[1];
}

/** Runs UPDATE/DELETE ... RETURNING and returns the returned rows (TypeORM wraps them as `[rows, count]`). */
export async function returning<T>(db: Queryable, sql: string, params: readonly unknown[] = []): Promise<T[]> {
  const result = (await db.query(sql, [...params])) as [T[], number];
  return result[0];
}

/** Serializes concurrent work on the same logical key for the rest of the current transaction. */
export async function advisoryLock(db: Queryable, key: string): Promise<void> {
  await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [key]);
}
