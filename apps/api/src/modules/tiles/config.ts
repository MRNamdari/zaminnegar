import { registerAs } from "@nestjs/config";

const numberFromEnv = (key: string, fallback: number): number => {
  const value = process.env[key];
  if (value === undefined || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0)
    throw new Error(`Invalid ${key}`);
  return parsed;
};

export default registerAs("tiles", () => ({
  cacheDir: process.env.TILE_CACHE_DIR ?? "/var/cache/esri-tiles",
  maxCacheBytes: numberFromEnv("TILE_CACHE_MAX_BYTES", 10 * 1024 ** 3),
  maxTileBytes: numberFromEnv("TILE_MAX_BYTES", 2 * 1024 ** 2),
  ttlSeconds: numberFromEnv("TILE_TTL_SECONDS", 30 * 86400),
  negativeTtlSeconds: numberFromEnv("TILE_NEGATIVE_TTL_SECONDS", 300),
  maxZoom: numberFromEnv("TILE_MAX_ZOOM", 19),
  upstreamUrl:
    process.env.UPSTREAM_URL ??
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile",
  upstreamTimeoutMs: numberFromEnv("UPSTREAM_TIMEOUT_MS", 10000),
  upstreamRetries: numberFromEnv("UPSTREAM_RETRIES", 3),
  circuitThreshold: numberFromEnv("UPSTREAM_CIRCUIT_THRESHOLD", 5),
  circuitResetMs: numberFromEnv("UPSTREAM_CIRCUIT_RESET_MS", 30000),
  lockWaitMs: numberFromEnv("LOCK_WAIT_MS", 15000),
  lockStaleMs: numberFromEnv("LOCK_STALE_MS", 120000),
}));
