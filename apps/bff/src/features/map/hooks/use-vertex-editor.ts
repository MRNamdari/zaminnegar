'use client';

import type { ParcelDto } from '@zaminnegar/api-client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useParcelPreview, useUpdateParcel } from '@/features/parcels/hooks/use-update-parcel';
import type { Position } from '../types';
import { GEOMETRY_ISSUE_MESSAGES } from '../lib/geometry-issue';
import {
  insertVertexAfter, removeVertex, replaceVertex, toMultiPolygon, toOpenRings, validateOpenRings, type OpenRings, type VertexPath,
} from '../lib/geometry';

/**
 * Local, live-editable copy of a parcel's rings. Dragging only changes local state;
 * releasing (or inserting/removing a vertex) validates the result, shows it instantly
 * and saves it. Invalid results are rejected and the parcel snaps back.
 */
export function useVertexEditor(projectId: string, parcel: ParcelDto | undefined) {
  const preview = useParcelPreview(projectId);
  const updateParcel = useUpdateParcel(projectId);
  const [rings, setRings] = useState<OpenRings>([]);
  const latest = useRef<OpenRings>([]);

  const reset = useCallback((source: ParcelDto | undefined) => {
    latest.current = source ? toOpenRings(source.geometry) : [];
    setRings(latest.current);
  }, []);

  // Re-sync only when another parcel is selected or its geometry changes; unrelated cache
  // updates (e.g. the recomputed area) must not interrupt an ongoing drag.
  const parcelId = parcel?.id;
  const geometry = parcel?.geometry;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => reset(parcel), [parcelId, geometry, reset]);

  const apply = useCallback((next: OpenRings) => {
    latest.current = next;
    setRings(next);
  }, []);

  /** Live update while a vertex is being dragged (no validation, no save). */
  const moveVertex = useCallback((path: VertexPath, position: Position) => apply(replaceVertex(latest.current, path, position)), [apply]);

  /** Validates `candidate` (default: the current rings) and saves it, or snaps back when invalid. */
  const commit = useCallback(
    (candidate: OpenRings = latest.current) => {
      if (!parcel) return;
      const issue = validateOpenRings(candidate);
      if (issue) {
        toast.error(GEOMETRY_ISSUE_MESSAGES[issue]);
        reset(parcel);
        return;
      }
      apply(candidate);
      const geometry = toMultiPolygon(candidate);
      preview(parcel.id, { geometry });
      updateParcel.mutate({ parcelId: parcel.id, patch: { geometry } });
    },
    [parcel, apply, reset, preview, updateParcel],
  );

  const insertVertex = useCallback((path: VertexPath, position: Position) => commit(insertVertexAfter(latest.current, path, position)), [commit]);

  const deleteVertex = useCallback(
    (path: VertexPath) => {
      if (latest.current[path.polygon][path.ring].length <= 3) {
        toast.error(GEOMETRY_ISSUE_MESSAGES.TOO_FEW_VERTICES_TO_REMOVE);
        return;
      }
      commit(removeVertex(latest.current, path));
    },
    [commit],
  );

  return { rings, moveVertex, commit, insertVertex, deleteVertex };
}

/** Return type of {@link useVertexEditor}. */
export type VertexEditor = ReturnType<typeof useVertexEditor>;
