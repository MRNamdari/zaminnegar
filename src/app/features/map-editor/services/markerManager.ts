import maplibregl from "maplibre-gl";
import { centroid } from "./geoUtils";
import type { Level } from "../types";

export interface MarkerItem {
  id: string;
  name: string;
  level: Level;
  ring: number[][];
}

export class MarkerManager {
  private markers = new Map<string, maplibregl.Marker>();

  constructor(private map: maplibregl.Map) {}

  sync(items: MarkerItem[]) {
    const alive = new Set(items.map((item) => item.id));

    this.markers.forEach((marker, id) => {
      if (!alive.has(id)) {
        marker.remove();
        this.markers.delete(id);
      }
    });

    items.forEach((item) => {
      const position = centroid(item.ring);

      let marker = this.markers.get(item.id);

      if (!marker) {
        const element = document.createElement("div");

        element.dir = "rtl";
        element.className =
          "pointer-events-none whitespace-nowrap rounded-md bg-[#0b2a4a]/90 px-2.5 py-1 text-[11px] font-medium text-white shadow ring-1 ring-white/10 font-[Vazirmatn]";

        marker = new maplibregl.Marker({ element })
          .setLngLat(position)
          .addTo(this.map);

        this.markers.set(item.id, marker);
      }

      marker.setLngLat(position);
      marker.getElement().textContent = item.name;

      marker.getElement().style.display =
        item.level === "parcel" ? "none" : "block";
    });
  }

  clear() {
    this.markers.forEach((marker) => marker.remove());
    this.markers.clear();
  }
}
