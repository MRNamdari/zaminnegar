import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export async function paginate<E extends ObjectLiteral>(
  qb: SelectQueryBuilder<E>,
  { page, limit }: { page: number; limit: number },
): Promise<PaginatedResult<E>> {
  const [items, total] = await qb
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();
  return { items, total, page, limit };
}

/** Escapes LIKE wildcards so user input is matched literally. */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}
