/** A page of results plus the total number of matching rows. */
export interface IPaginated<T> {
  items: T[];
  total: number;
}
