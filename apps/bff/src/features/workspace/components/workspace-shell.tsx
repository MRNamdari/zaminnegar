'use client';

import { Suspense } from 'react';
import { MapProvider } from 'react-map-gl/maplibre';
import type { MapConfig } from '@/features/map/types';
import { DrawingProvider } from '../context/drawing-context';
import { WorkspaceProvider } from '../context/workspace-context';
import { WorkspaceLayout } from './workspace-layout';

interface WorkspaceShellProps {
  projectId: string;
  mapConfig: MapConfig;
}

/** Wires up every provider the workspace needs (URL state, drawing state, map instance access). */
export function WorkspaceShell({ projectId, mapConfig }: WorkspaceShellProps) {
  return (
    // nuqs reads the URL through useSearchParams, which needs a Suspense boundary.
    <Suspense>
      <WorkspaceProvider projectId={projectId}>
        <DrawingProvider>
          <MapProvider>
            <WorkspaceLayout mapConfig={mapConfig} />
          </MapProvider>
        </DrawingProvider>
      </WorkspaceProvider>
    </Suspense>
  );
}
