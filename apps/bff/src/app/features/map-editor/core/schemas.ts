import { z } from "zod";

/**
 * Single source of truth for data shapes. Types are inferred from these schemas
 * and the same schemas validate backend responses and operation inputs.
 */

export const LEVELS = ["region", "block", "parcel"] as const;
export const levelSchema = z.enum(LEVELS);
export type Level = z.infer<typeof levelSchema>;

export const TOOLS = ["select", "polygon", "rectangle"] as const;
export const toolSchema = z.enum(TOOLS);
export type Tool = z.infer<typeof toolSchema>;
export type DrawTool = Exclude<Tool, "select">;

export const positionSchema = z.tuple([z.number(), z.number()]);
export type Position = z.infer<typeof positionSchema>;

export const polygonGeometrySchema = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(z.array(positionSchema).min(4)).min(1),
});
export type PolygonGeometry = z.infer<typeof polygonGeometrySchema>;

/** Domain properties owned by the backend. UI state (selection, visibility, editability) is never stored here. */
export const areaPropertiesSchema = z.looseObject({
  level: levelSchema,
  name: z.string(),
  areaHa: z.number().nonnegative().optional(),
  /** Monotonic server version used for optimistic concurrency. */
  version: z.number().int().nonnegative().optional(),
  parentId: z.string().nullable().optional(),
});
export type AreaProperties = z.infer<typeof areaPropertiesSchema>;

export const areaFeatureSchema = z.object({
  type: z.literal("Feature"),
  id: z.string().min(1),
  geometry: polygonGeometrySchema,
  properties: areaPropertiesSchema,
});
export type AreaFeature = z.infer<typeof areaFeatureSchema>;

export const areaCollectionSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(areaFeatureSchema),
});
export type AreaCollection = z.infer<typeof areaCollectionSchema>;

/* ---------------------------- operation contracts --------------------------- */

/** Values collected by the sequential draft-configuration forms. */
export const draftConfigurationPropertiesSchema = z.looseObject({
  name: z.string().trim().min(1).optional(),
  parentId: z.string().nullable().optional(),
});
export type DraftConfigurationProperties = z.infer<
  typeof draftConfigurationPropertiesSchema
>;

export const createFeatureRequestSchema = z.object({
  /** Temporary client-side id. Never a database id. */
  draftId: z.string().min(1),
  geometry: polygonGeometrySchema,
  properties: z.looseObject({
    level: levelSchema,
    name: z.string().min(1),
    parentId: z.string().nullable().optional(),
  }),
});
export type CreateFeatureRequest = z.infer<typeof createFeatureRequestSchema>;

export const updateFeatureRequestSchema = z.object({
  id: z.string().min(1),
  /** Version the edit was based on; the backend rejects stale writes. */
  expectedVersion: z.number().int().nonnegative().optional(),
  geometry: polygonGeometrySchema,
  properties: z.object({ name: z.string().min(1).optional() }).optional(),
});
export type UpdateFeatureRequest = z.infer<typeof updateFeatureRequestSchema>;

export const deleteFeatureRequestSchema = z.object({
  id: z.string().min(1),
  expectedVersion: z.number().int().nonnegative().optional(),
});
export type DeleteFeatureRequest = z.infer<typeof deleteFeatureRequestSchema>;
