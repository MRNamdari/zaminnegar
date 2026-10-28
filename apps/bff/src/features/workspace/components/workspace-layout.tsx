'use client';

import { List, SlidersHorizontal, Sprout } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { InteractiveMap } from '@/features/map/components/interactive-map';
import { MapControls } from '@/features/map/components/map-controls';
import { MapToolbar } from '@/features/map/components/map-toolbar';
import { PolygonDrawingTools } from '@/features/map/components/polygon-drawing-tools';
import type { MapConfig } from '@/features/map/types';
import { GeoJsonExportButton } from '@/features/parcels/components/geojson-export-button';
import { ParcelList } from '@/features/parcels/components/parcel-list';
import { ParcelPropertiesPanel } from '@/features/parcels/components/parcel-properties-panel';
import { ProjectSelector } from '@/features/projects/components/project-selector';
import { useProjects } from '@/features/projects/hooks/use-projects';
import { RegionSelector } from '@/features/regions/components/region-selector';
import { SearchLocation } from '@/features/search/components/search-location';
import { cn } from '@/lib/utils/cn';
import { fa } from '@/messages/fa';
import { useWorkspace } from '../context/workspace-context';
import { SyncStatus } from './sync-status';
import { WorkspaceHint } from './workspace-hint';

type SidePanel = 'list' | 'properties' | null;

/** Desktop: list | map | properties. Small screens: the side panels become bottom sheets. */
export function WorkspaceLayout({ mapConfig }: { mapConfig: MapConfig }) {
  const { projectId, mode } = useWorkspace();
  const { data } = useProjects();
  const [panel, setPanel] = useState<SidePanel>(null);
  const projectName = data?.items.find((project) => project.id === projectId)?.name ?? '';

  const sheet = (name: Exclude<SidePanel, null>) =>
    cn(
      'overflow-y-auto bg-panel',
      'max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-40 max-lg:max-h-[60dvh] max-lg:translate-y-full max-lg:rounded-t-2xl max-lg:shadow-2xl max-lg:transition-transform',
      panel === name && 'max-lg:translate-y-0',
    );

  return (
    <div className="grid h-dvh grid-rows-[auto_1fr]">
      <header className="flex flex-wrap items-center gap-3 bg-[#1d3328] px-4 py-2 text-white">
        <h1 className="flex items-center gap-2 font-bold text-saffron">
          <Sprout className="size-5" />
          <span className="max-sm:sr-only">{fa.appName}</span>
        </h1>
        <ProjectSelector currentProjectId={projectId} />
        <RegionSelector />
        <SearchLocation />
        <div className="ms-auto flex items-center gap-2">
          <SyncStatus />
          <GeoJsonExportButton projectId={projectId} projectName={projectName} />
          <div className="flex gap-1 lg:hidden">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" aria-label={fa.panels.list} onClick={() => setPanel(panel === 'list' ? null : 'list')}>
              <List className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" aria-label={fa.panels.properties} onClick={() => setPanel(panel === 'properties' ? null : 'properties')}>
              <SlidersHorizontal className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="grid min-h-0 lg:grid-cols-[18rem_minmax(0,1fr)_20rem]">
        <aside className={cn(sheet('list'), 'lg:border-e lg:border-line')}>
          <ParcelList />
        </aside>

        <div className="relative min-h-0 min-w-0 bg-[#1d2b24]">
          <InteractiveMap config={mapConfig} />
          <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex flex-col items-center gap-2 *:pointer-events-auto">
            <MapToolbar />
            {mode === 'draw' && <PolygonDrawingTools />}
            <WorkspaceHint />
          </div>
          <MapControls config={mapConfig} />
        </div>

        <aside className={cn(sheet('properties'), 'lg:border-s lg:border-line')}>
          <ParcelPropertiesPanel />
        </aside>
      </main>
    </div>
  );
}
