'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Position } from '@/features/map/types';
import { useWorkspace } from './workspace-context';

interface DrawingContextValue {
  /** Vertices of the polygon being drawn, in click order. */
  vertices: Position[];
  addVertex: (position: Position) => void;
  undoVertex: () => void;
  clearVertices: () => void;
}

const DrawingContext = createContext<DrawingContextValue | null>(null);

/** Holds the in-progress polygon. The draft is discarded whenever the user leaves draw mode. */
export function DrawingProvider({ children }: { children: ReactNode }) {
  const { mode } = useWorkspace();
  const [vertices, setVertices] = useState<Position[]>([]);

  useEffect(() => {
    if (mode !== 'draw') setVertices([]);
  }, [mode]);

  const addVertex = useCallback((position: Position) => setVertices((current) => [...current, position]), []);
  const undoVertex = useCallback(() => setVertices((current) => current.slice(0, -1)), []);
  const clearVertices = useCallback(() => setVertices([]), []);

  const value = useMemo(() => ({ vertices, addVertex, undoVertex, clearVertices }), [vertices, addVertex, undoVertex, clearVertices]);
  return <DrawingContext.Provider value={value}>{children}</DrawingContext.Provider>;
}

/** Reads the drawing state. Must be used below {@link DrawingProvider}. */
export function useDrawing(): DrawingContextValue {
  const context = useContext(DrawingContext);
  if (!context) throw new Error('useDrawing must be used inside <DrawingProvider>');
  return context;
}
