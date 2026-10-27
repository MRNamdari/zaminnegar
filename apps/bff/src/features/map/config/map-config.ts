import 'server-only';
import { env } from '@/config/env';
import type { ImageryConfig, MapConfig, Position } from '../types';

const ESRI: ImageryConfig = {
  tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
  tileSize: 256,
  maxzoom: 17,
  attribution: 'Imagery © Esri, Maxar, Earthstar Geographics, and the GIS User Community',
};

function resolveImagery(): { imagery: ImageryConfig; fallback: boolean } {
  if (env.MAP_IMAGERY_PROVIDER === 'mapbox' && env.MAPBOX_TOKEN) {
    return {
      fallback: false,
      imagery: {
        tiles: [`https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.jpg90?access_token=${env.MAPBOX_TOKEN}`],
        tileSize: 512,
        maxzoom: 21,
        attribution: '© Mapbox © Maxar',
      },
    };
  }
  if (env.MAP_IMAGERY_PROVIDER === 'maptiler' && env.MAPTILER_KEY) {
    return {
      fallback: false,
      imagery: {
        tiles: [`https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=${env.MAPTILER_KEY}`],
        tileSize: 512,
        maxzoom: 20,
        attribution: '© MapTiler © Maxar',
      },
    };
  }
  return { imagery: ESRI, fallback: env.MAP_IMAGERY_PROVIDER !== 'esri' };
}

/**
 * Builds the serializable map configuration for client components.
 * Runs on the server, so provider selection and defaults come from validated env.
 * Note: Mapbox/MapTiler tile URLs contain a (public, domain-restricted) key and reach the browser by design.
 */
export function getMapConfig(): MapConfig {
  const { imagery, fallback } = resolveImagery();
  const [longitude, latitude] = env.MAP_DEFAULT_CENTER.split(',').map(Number);
  return {
    imagery,
    defaultCenter: [longitude, latitude] satisfies Position,
    defaultZoom: env.MAP_DEFAULT_ZOOM,
    imageryFallback: fallback,
  };
}
