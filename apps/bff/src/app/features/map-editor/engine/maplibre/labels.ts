import { Marker, type Map as MapLibreMap } from "maplibre-gl";
import type { EditorConfig } from "../../core/config";
import type { AreaFeature } from "../../core/schemas";
import { centroid } from "../../domain/geometry";

interface Entry {
  feature: AreaFeature;
  marker: Marker;
}

/** Feature name labels as DOM markers, updated incrementally (unchanged feature references are skipped). */
export class LabelLayer {
  private entries = new Map<string, Entry>();

  constructor(private readonly map: MapLibreMap) {}

  sync(features: readonly AreaFeature[], labels: EditorConfig["features"]["labels"]): void {
    const wanted = new Map<string, AreaFeature>();
    if (labels.enabled) {
      for (const feature of features) {
        if (!labels.hiddenLevels.includes(feature.properties.level)) wanted.set(feature.id, feature);
      }
    }

    for (const [id, entry] of this.entries) {
      if (!wanted.has(id)) {
        entry.marker.remove();
        this.entries.delete(id);
      }
    }

    for (const [id, feature] of wanted) {
      const existing = this.entries.get(id);
      if (existing?.feature === feature) continue;
      const position = centroid(feature.geometry.coordinates[0] ?? []);
      if (existing) {
        existing.marker.setLngLat(position);
        existing.marker.getElement().textContent = feature.properties.name;
        existing.feature = feature;
        continue;
      }
      const element = document.createElement("div");
      element.dir = "rtl";
      element.className =
        "pointer-events-none whitespace-nowrap rounded-md bg-[#0b2a4a]/90 px-2.5 py-1 text-[11px] font-medium text-white shadow ring-1 ring-white/10 font-[Vazirmatn]";
      element.textContent = feature.properties.name;
      const marker = new Marker({ element }).setLngLat(position).addTo(this.map);
      this.entries.set(id, { feature, marker });
    }
  }

  clear(): void {
    for (const entry of this.entries.values()) entry.marker.remove();
    this.entries.clear();
  }
}
