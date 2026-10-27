'use client';

import { useQueryStates } from 'nuqs';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { workspaceSearchParams, type Basemap, type MapMode } from '../search-params';

interface WorkspaceContextValue {
  projectId: string;
  /** Selected parcel (`?parcel=`), or `null`. */
  selectedParcelId: string | null;
  mode: MapMode;
  basemap: Basemap;
  /** Text filter of the parcel list (`?q=`). */
  parcelFilter: string;
  /** Selects a parcel; selecting `null` leaves edit mode. */
  selectParcel: (parcelId: string | null) => void;
  setMode: (mode: MapMode) => void;
  setBasemap: (basemap: Basemap) => void;
  setParcelFilter: (filter: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

/** Holds the state shared by the toolbar, list, properties panel and map. URL-backed values use nuqs. */
export function WorkspaceProvider({ projectId, children }: { projectId: string; children: ReactNode }) {
  const [state, setState] = useQueryStates(workspaceSearchParams, { history: 'replace', clearOnDefault: true });

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      projectId,
      selectedParcelId: state.parcel,
      mode: state.mode,
      basemap: state.basemap,
      parcelFilter: state.q,
      selectParcel: (parcelId) =>
        void setState((current) => ({ parcel: parcelId, mode: parcelId === null && current.mode === 'edit' ? 'select' : current.mode })),
      setMode: (mode) => void setState({ mode }),
      setBasemap: (basemap) => void setState({ basemap }),
      setParcelFilter: (filter) => void setState({ q: filter }),
    }),
    [projectId, state, setState],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

/** Reads the workspace state. Must be used below {@link WorkspaceProvider}. */
export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used inside <WorkspaceProvider>');
  return context;
}
