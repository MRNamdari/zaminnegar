/**
 * Slack for the spatial rules, in square meters. Hand-drawn or snapped polygons never match to the
 * last decimal, so a child may stick out of its container, and siblings may overlap, by up to this
 * much before the check fails.
 */
export const GEOMETRY_TOLERANCE_M2 = 1;
