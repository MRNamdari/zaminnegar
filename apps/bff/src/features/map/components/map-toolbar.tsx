'use client';

import { MousePointer2, PenTool, Spline, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useDeleteParcel } from '@/features/parcels/hooks/use-delete-parcel';
import { useParcels } from '@/features/parcels/hooks/use-parcels';
import { useWorkspace } from '@/features/workspace/context/workspace-context';
import type { MapMode } from '@/features/workspace/search-params';
import { fa } from '@/messages/fa';

const TOOLS: ReadonlyArray<{ mode: MapMode; label: string; icon: typeof PenTool; needsSelection: boolean }> = [
  { mode: 'select', label: fa.map.toolSelect, icon: MousePointer2, needsSelection: false },
  { mode: 'draw', label: fa.map.toolDraw, icon: PenTool, needsSelection: false },
  { mode: 'edit', label: fa.map.toolEdit, icon: Spline, needsSelection: true },
];

/** Tool picker (select / draw / edit vertices) and "delete selected parcel". */
export function MapToolbar() {
  const { projectId, mode, setMode, selectedParcelId, selectParcel } = useWorkspace();
  const { data: parcels = [] } = useParcels(projectId);
  const deleteParcel = useDeleteParcel(projectId);
  const [confirming, setConfirming] = useState(false);
  const selected = parcels.find((parcel) => parcel.id === selectedParcelId);

  return (
    <div role="toolbar" className="flex gap-1 rounded-xl border border-line bg-panel/95 p-1 shadow-lg">
      {TOOLS.map(({ mode: toolMode, label, icon: Icon, needsSelection }) => (
        <Button
          key={toolMode}
          variant="toolbar"
          data-active={mode === toolMode}
          aria-pressed={mode === toolMode}
          disabled={needsSelection && !selected}
          onClick={() => setMode(mode === toolMode ? 'select' : toolMode)}
        >
          <Icon className="size-4" />
          <span className="max-lg:sr-only">{label}</span>
        </Button>
      ))}
      <Button variant="destructive" disabled={!selected} onClick={() => setConfirming(true)}>
        <Trash2 className="size-4" />
        <span className="max-lg:sr-only">{fa.map.toolDelete}</span>
      </Button>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={fa.parcels.deleteTitle}
        description={fa.parcels.deleteHint(selected?.name ?? '')}
        onConfirm={() => selected && deleteParcel.mutate(selected.id, { onSuccess: () => selectParcel(null) })}
      />
    </div>
  );
}
