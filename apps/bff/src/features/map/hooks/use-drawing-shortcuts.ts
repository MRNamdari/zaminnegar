'use client';

import { useEffect } from 'react';
import { useDrawing } from '@/features/workspace/context/drawing-context';
import { useWorkspace } from '@/features/workspace/context/workspace-context';

/** Keyboard shortcuts: Esc leaves the current tool, Enter finishes, Backspace / Ctrl+Z undoes a vertex. */
export function useDrawingShortcuts(finishDrawing: () => void) {
  const { mode, setMode } = useWorkspace();
  const { undoVertex } = useDrawing();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
      if (event.key === 'Escape' && mode !== 'select') setMode('select');
      if (mode !== 'draw') return;
      if (event.key === 'Enter') finishDrawing();
      if (event.key === 'Backspace' || (event.key === 'z' && (event.ctrlKey || event.metaKey))) {
        event.preventDefault();
        undoVertex();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode, setMode, undoVertex, finishDrawing]);
}
