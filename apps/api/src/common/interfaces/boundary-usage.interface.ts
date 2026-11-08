/** The three kinds of feature that own a boundary. A boundary owned by none of them is a draft. */
export type FeatureKind = 'region' | 'block' | 'parcel';

export interface BoundaryUsage {
  kind: FeatureKind;
  /** Id of the region, block or parcel that owns the boundary. */
  featureId: string;
  projectId: string;
  regionId: string;
  /** Only set for parcels that sit in a block. */
  blockId: string | null;
}
