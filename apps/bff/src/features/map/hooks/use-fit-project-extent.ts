'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-map-gl/maplibre';
import { useProjects } from '@/features/projects/hooks/use-projects';
import { FIT_BOUNDS_OPTIONS, toLngLatBounds } from '../lib/geometry';

/** Zooms the map to the project's saved extent once, when the project is first opened. */
export function useFitProjectExtent(projectId: string) {
  const { current: map } = useMap();
  const { data } = useProjects();
  const fittedFor = useRef<string | null>(null);
  const extent = data?.items.find((project) => project.id === projectId)?.extent;

  useEffect(() => {
    if (!map || !extent || fittedFor.current === projectId) return;
    fittedFor.current = projectId;
    map.fitBounds(toLngLatBounds(extent), FIT_BOUNDS_OPTIONS);
  }, [map, extent, projectId]);
}
