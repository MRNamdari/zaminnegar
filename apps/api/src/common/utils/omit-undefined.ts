/** Returns a copy of `value` without keys whose value is `undefined` (so partial updates stay partial). */
export function omitUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as Partial<T>;
}
