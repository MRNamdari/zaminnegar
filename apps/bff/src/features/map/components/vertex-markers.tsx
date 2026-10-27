'use client';

import { Marker } from 'react-map-gl/maplibre';
import { midpoint } from '../lib/geometry';
import type { VertexEditor } from '../hooks/use-vertex-editor';

/**
 * Draggable handles for every vertex of the selected parcel, plus a small handle at the middle
 * of each edge that inserts a vertex. Double-click a vertex to remove it.
 */
export function VertexMarkers({ editor }: { editor: VertexEditor }) {
  return (
    <>
      {editor.rings.flatMap((poly, polygon) =>
        poly.flatMap((ring, ringIndex) =>
          ring.flatMap((position, index) => {
            const path = { polygon, ring: ringIndex, index };
            const next = ring[(index + 1) % ring.length];
            const mid = midpoint(position, next);
            return [
              <Marker
                key={`vertex-${polygon}-${ringIndex}-${index}`}
                longitude={position[0]}
                latitude={position[1]}
                draggable
                onDrag={(event) => editor.moveVertex(path, [event.lngLat.lng, event.lngLat.lat])}
                onDragEnd={() => editor.commit()}
              >
                <button
                  type="button"
                  aria-label="vertex"
                  onDoubleClick={() => editor.deleteVertex(path)}
                  className="block size-4 cursor-grab rounded-full border-2 border-ink bg-white active:cursor-grabbing"
                />
              </Marker>,
              <Marker key={`mid-${polygon}-${ringIndex}-${index}`} longitude={mid[0]} latitude={mid[1]}>
                <button
                  type="button"
                  aria-label="insert vertex"
                  onClick={() => editor.insertVertex(path, mid)}
                  className="block size-2.5 cursor-copy rounded-full border border-ink bg-saffron opacity-80 hover:opacity-100"
                />
              </Marker>,
            ];
          }),
        ),
      )}
    </>
  );
}
