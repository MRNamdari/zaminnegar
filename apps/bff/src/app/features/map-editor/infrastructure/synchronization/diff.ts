import type { RenderModel } from "../../engine/contracts";
import type { AreaFeature } from "../../core/schemas";
import { sameGeometry } from "../../domain/geometry";

export interface RenderDiff {
  add: AreaFeature[];
  remove: string[];
  /** Canonical geometry should replace what the drawing engine holds. */
  geometry: AreaFeature[];
  /** Rendering-relevant properties changed. */
  properties: AreaFeature[];
}

/**
 * Computes the minimal set of drawing-engine mutations for a new render model.
 *
 * - Unchanged feature objects (same reference) are skipped without inspection, so a
 *   TanStack Query refetch with structural sharing costs O(n) pointer comparisons.
 * - Locked features keep their local geometry; when they are unlocked (commit or
 *   cancel) the canonical geometry is re-applied.
 */
export function diffRenderModel(
  rendered: ReadonlyMap<string, AreaFeature>,
  previouslyLocked: ReadonlySet<string>,
  model: Pick<RenderModel, "features" | "lockedFeatureIds">,
): RenderDiff {
  const diff: RenderDiff = { add: [], remove: [], geometry: [], properties: [] };
  const next = new Map<string, AreaFeature>();

  for (const feature of model.features) {
    next.set(feature.id, feature);
    const prev = rendered.get(feature.id);
    if (!prev) {
      diff.add.push(feature);
      continue;
    }
    const wasLocked = previouslyLocked.has(feature.id);
    const isLocked = model.lockedFeatureIds.has(feature.id);

    if (wasLocked && !isLocked) {
      diff.geometry.push(feature); // session ended: discard local geometry in favour of canonical
    } else if (prev !== feature && !isLocked && !sameGeometry(prev.geometry, feature.geometry)) {
      diff.geometry.push(feature);
    }
    if (prev !== feature && prev.properties.level !== feature.properties.level) {
      diff.properties.push(feature);
    }
  }

  for (const id of rendered.keys()) {
    if (!next.has(id) && !model.lockedFeatureIds.has(id)) diff.remove.push(id);
  }
  return diff;
}

/** Folds an applied diff into the record of what the drawing engine holds. */
export function nextRendered(
  rendered: ReadonlyMap<string, AreaFeature>,
  model: Pick<RenderModel, "features" | "lockedFeatureIds">,
  diff: RenderDiff,
): Map<string, AreaFeature> {
  const result = new Map(rendered);
  for (const id of diff.remove) result.delete(id);
  for (const feature of model.features) result.set(feature.id, feature);
  return result;
}
