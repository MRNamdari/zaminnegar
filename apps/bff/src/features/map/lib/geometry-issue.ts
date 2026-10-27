import { fa } from '@/messages/fa';

/** Problems detected locally before a polygon is sent to the API. */
export type GeometryIssue = 'TOO_FEW_VERTICES' | 'DUPLICATE_VERTEX' | 'SELF_INTERSECTION' | 'TOO_FEW_VERTICES_TO_REMOVE';

/** User-facing (Persian) description of every {@link GeometryIssue}. */
export const GEOMETRY_ISSUE_MESSAGES: Record<GeometryIssue, string> = {
  TOO_FEW_VERTICES: fa.geometry.tooFewVertices,
  DUPLICATE_VERTEX: fa.geometry.duplicateVertex,
  SELF_INTERSECTION: fa.geometry.selfIntersection,
  TOO_FEW_VERTICES_TO_REMOVE: fa.geometry.minVertices,
};
