import type { AreaCollection, AreaFeature } from "../../core/schemas";

/** Pure cache transforms used after confirmed backend results. Unchanged features keep their identity. */

export function upsertFeature(collection: AreaCollection, feature: AreaFeature): AreaCollection {
  const index = collection.features.findIndex((f) => f.id === feature.id);
  if (index === -1) return { ...collection, features: [...collection.features, feature] };
  const features = collection.features.slice();
  features[index] = feature;
  return { ...collection, features };
}

export function removeFeature(collection: AreaCollection, id: string): AreaCollection {
  if (!collection.features.some((f) => f.id === id)) return collection;
  return { ...collection, features: collection.features.filter((f) => f.id !== id) };
}
