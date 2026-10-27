'use client';

import { Check, Undo2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDrawing } from '@/features/workspace/context/drawing-context';
import { useWorkspace } from '@/features/workspace/context/workspace-context';
import { fa } from '@/messages/fa';
import { useFinishDrawing } from '../hooks/use-finish-drawing';

/** Undo / finish / cancel controls, shown only while drawing. */
export function PolygonDrawingTools() {
  const { setMode } = useWorkspace();
  const { vertices, undoVertex, clearVertices } = useDrawing();
  const finishDrawing = useFinishDrawing();

  return (
    <div role="toolbar" className="flex items-center gap-1 rounded-xl border border-line bg-panel/95 p-1 shadow-lg">
      <span className="px-2 text-ink-soft" aria-live="polite">
        {fa.map.vertices(vertices.length)}
      </span>
      <Button variant="toolbar" disabled={vertices.length === 0} onClick={undoVertex}>
        <Undo2 className="size-4" />
        <span className="max-lg:sr-only">{fa.map.undo}</span>
      </Button>
      <Button variant="accent" disabled={vertices.length < 3} onClick={() => void finishDrawing()}>
        <Check className="size-4" />
        <span className="max-lg:sr-only">{fa.map.finish}</span>
      </Button>
      <Button
        variant="toolbar"
        onClick={() => {
          clearVertices();
          setMode('select');
        }}
      >
        <X className="size-4" />
        <span className="max-lg:sr-only">{fa.map.cancelDrawing}</span>
      </Button>
    </div>
  );
}
