/**
 * The area every region, block, parcel and boundary response reports as `areaM2`:
 * the user-supplied `manualAreaM2` when there is one, otherwise the geodesic `computedAreaM2`.
 */
export function effectiveAreaM2(boundary: { manualAreaM2?: number | null; computedAreaM2: number }): number {
  return boundary.manualAreaM2 ?? boundary.computedAreaM2;
}

/**
 * SQL for the same rule, as a correlated subquery over the row that owns a `boundary_id`
 * (`ownerAlias` is the already-escaped alias of the regions/blocks/parcels row).
 * Used by the `areaM2` virtual column of Region, Block and Parcel, so those tables hold no area of their own.
 */
export const effectiveAreaSql = (ownerAlias: string): string =>
  `SELECT COALESCE("area_boundary"."manual_area_m2", "area_boundary"."computed_area_m2") ` +
  `FROM "boundaries" "area_boundary" WHERE "area_boundary"."id" = ${ownerAlias}."boundary_id"`;
