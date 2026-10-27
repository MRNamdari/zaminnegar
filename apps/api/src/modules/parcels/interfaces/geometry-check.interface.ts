/** Result of asking PostGIS to validate a candidate geometry. */
export interface IGeometryCheck {
  isValid: boolean;
  /** `ST_IsValidReason` output, e.g. `Self-intersection[49.6 37.3]`. */
  reason: string;
  /** Geodesic area in square meters (0 for invalid geometry). */
  areaM2: number;
}
