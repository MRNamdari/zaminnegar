export function MiniMap() {
  return (
    <div className="absolute bottom-3 left-3 z-20 h-28 w-28 overflow-hidden rounded-xl ring-2 ring-[#0e1726]">
      <div id="map-editor-minimap" className="h-full w-full" />

      <span className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 ring-2 ring-white" />
    </div>
  );
}
