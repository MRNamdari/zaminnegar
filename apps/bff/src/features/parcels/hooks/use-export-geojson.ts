'use client';

import { useMutation } from '@tanstack/react-query';
import { unwrapActionResult } from '@/lib/actions/unwrap-action-result';
import { downloadJson } from '@/lib/utils/download';
import { exportGeoJsonAction } from '../actions/export-geojson.action';

/** Fetches the project's GeoJSON and saves it as `<project name>.geojson`. */
export function useExportGeoJson(projectId: string, projectName: string) {
  return useMutation({
    mutationFn: async () => {
      const collection = unwrapActionResult(await exportGeoJsonAction(projectId));
      downloadJson(`${projectName || 'parcels'}.geojson`, collection, 'application/geo+json');
    },
  });
}
