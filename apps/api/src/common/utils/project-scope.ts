import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

/**
 * Data-level authorization for list queries: restricts `column` to the projects the caller may read.
 * `null`/`undefined` means unrestricted (global role, or an explicit projectId filter already authorized).
 */
export function applyProjectScope<E extends ObjectLiteral>(
  qb: SelectQueryBuilder<E>,
  column: string,
  scope: string[] | null | undefined,
): SelectQueryBuilder<E> {
  if (scope === null || scope === undefined) return qb;
  if (scope.length === 0) return qb.andWhere('1 = 0');
  return qb.andWhere(`${column} IN (:...scopeProjectIds)`, { scopeProjectIds: scope });
}
