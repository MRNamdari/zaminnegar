import { forwardRef } from "react";

const MiniMap = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div className="absolute bottom-3 left-3 z-20 h-28 w-28 overflow-hidden rounded-xl ring-2 ring-border">
      <div ref={ref} className="h-full w-full" />

      <span className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-map-blue ring-2 ring-border" />
    </div>
  );
});

export { MiniMap };
