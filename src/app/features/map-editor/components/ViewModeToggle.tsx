"use client";

import { useMapEditor } from "../context/useMapEditor";

export function ViewModeToggle() {
  const { state, actions } = useMapEditor();

  return (
    <button
      type="button"
      onClick={() => actions.set3D(!state.is3D)}
      className="absolute bottom-3 right-3 z-20 flex items-center gap-2.5 rounded-full bg-[#0e1726]/95 py-1.5 pl-3 pr-1.5 text-xs font-semibold text-slate-200 ring-1 ring-white/10"
      aria-pressed={state.is3D}
    >
      3D
      <span
        className={`relative h-6 w-11 rounded-full transition-colors ${
          state.is3D ? "bg-blue-600" : "bg-slate-600"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
            state.is3D ? "left-5" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}
