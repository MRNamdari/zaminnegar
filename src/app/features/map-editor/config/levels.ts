import type { Level } from "../types";

export const LEVELS: Record<Level, { label: string; color: string }> = {
  region: {
    label: "Region",
    color: "--map-green",
  },
  block: {
    label: "Block",
    color: "--map-blue",
  },
  parcel: {
    label: "Parcel",
    color: "--map-yellow",
  },
};

export const SELECTED_COLOR = "--map-purple";

export const INITIAL_COUNTERS = {
  region: 0,
  block: 0,
  parcel: 0,
};
