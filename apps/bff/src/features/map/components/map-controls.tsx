'use client';

import { Home, Layers, LocateFixed, Minus, Plus } from 'lucide-react';
import { useMap } from 'react-map-gl/maplibre';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/features/workspace/context/workspace-context';
import { fa } from '@/messages/fa';
import { WORKSPACE_MAP_ID, type MapConfig } from '../types';

/** Zoom, home, "my location" and basemap switch, stacked at the map's inline-start edge. */
export function MapControls({ config }: { config: MapConfig }) {
  const map = useMap()[WORKSPACE_MAP_ID];
  const { basemap, setBasemap } = useWorkspace();

  const locate = () => {
    if (!navigator.geolocation) return void toast.error(fa.map.locateFailed);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => map?.flyTo({ center: [coords.longitude, coords.latitude], zoom: 16 }),
      () => toast.error(fa.map.locateFailed),
      { timeout: 8000 },
    );
  };

  const controls = [
    { label: fa.map.zoomIn, icon: Plus, run: () => map?.zoomIn() },
    { label: fa.map.zoomOut, icon: Minus, run: () => map?.zoomOut() },
    { label: fa.map.home, icon: Home, run: () => map?.flyTo({ center: config.defaultCenter, zoom: config.defaultZoom }) },
    { label: fa.map.locate, icon: LocateFixed, run: locate },
    {
      label: basemap === 'satellite' ? fa.map.showStreets : fa.map.showSatellite,
      icon: Layers,
      run: () => setBasemap(basemap === 'satellite' ? 'streets' : 'satellite'),
    },
  ];

  return (
    <div className="absolute inset-s-3 bottom-8 z-10 grid gap-1.5">
      {controls.map(({ label, icon: Icon, run }) => (
        <Button key={label} variant="outline" size="icon" aria-label={label} title={label} className="bg-panel/95 shadow" onClick={run}>
          <Icon className="size-4" />
        </Button>
      ))}
    </div>
  );
}
