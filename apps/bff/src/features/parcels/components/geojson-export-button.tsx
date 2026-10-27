'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fa } from '@/messages/fa';
import { useExportGeoJson } from '../hooks/use-export-geojson';

interface GeoJsonExportButtonProps {
  projectId: string;
  projectName: string;
}

/** Downloads the project's parcels as a `.geojson` file. */
export function GeoJsonExportButton({ projectId, projectName }: GeoJsonExportButtonProps) {
  const exportGeoJson = useExportGeoJson(projectId, projectName);
  return (
    <Button variant="ghost" className="text-white hover:bg-white/10" disabled={exportGeoJson.isPending} onClick={() => exportGeoJson.mutate()}>
      <Download className="size-4" />
      <span className="max-lg:sr-only">{fa.export.geojson}</span>
    </Button>
  );
}
