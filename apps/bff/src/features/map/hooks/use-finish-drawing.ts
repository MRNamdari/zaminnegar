'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useDrawing } from '@/features/workspace/context/drawing-context';
import { useWorkspace } from '@/features/workspace/context/workspace-context';
import { useCreateParcel } from '@/features/parcels/hooks/use-create-parcel';
import { GEOMETRY_ISSUE_MESSAGES } from '../lib/geometry-issue';
import { toMultiPolygon, validateRing } from '../lib/geometry';

/**
 * Returns a function that validates the drawn polygon, saves it as a new parcel and selects it.
 * When validation or saving fails the draft is kept so the user can fix it.
 */
export function useFinishDrawing() {
  const { projectId, setMode, selectParcel } = useWorkspace();
  const { vertices, clearVertices } = useDrawing();
  const createParcel = useCreateParcel(projectId);

  return useCallback(async () => {
    const issue = validateRing(vertices);
    if (issue) {
      toast.error(GEOMETRY_ISSUE_MESSAGES[issue]);
      return;
    }
    try {
      const parcel = await createParcel.mutateAsync(toMultiPolygon([[vertices]]));
      clearVertices();
      setMode('select');
      selectParcel(parcel.id);
    } catch {
      /* the global mutation toast explains the failure; the draft stays on the map */
    }
  }, [vertices, createParcel, clearVertices, setMode, selectParcel]);
}
