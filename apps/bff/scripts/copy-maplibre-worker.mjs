// MapLibre v6 locates its worker via import.meta.url, which bundlers rewrite to a non-http URL.
// We serve the worker from /public and point MapLibre at it with setWorkerUrl().
import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("public", { recursive: true });
copyFileSync("node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs", "public/maplibre-gl-worker.mjs");
console.log("copied maplibre-gl-worker.mjs to public/");
