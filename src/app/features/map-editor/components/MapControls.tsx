"use client";

import { LuLocateFixed, LuPlus, LuMinus } from "react-icons/lu";

import { useMapEditor } from "../context/useMapEditor";

export function MapControls() {
  const { state, actions } = useMapEditor();

  const locate = () => {
    navigator.geolocation?.getCurrentPosition((position) => {
      actions.flyTo([position.coords.longitude, position.coords.latitude], 16);
    });
  };

  const buttonClass =
    "flex h-9 w-9 items-center justify-center rounded-lg bg-[#0e1726]/95 text-slate-200 ring-1 ring-white/10 hover:bg-[#16233a]";

  return (
    <div className="absolute right-3 top-3 z-20 flex flex-col gap-2">
      <button
        type="button"
        className={buttonClass}
        onClick={locate}
        title="My location"
      >
        <LuLocateFixed size={18} />
      </button>

      <button
        type="button"
        className={buttonClass}
        onClick={actions.zoomIn}
        title="Zoom in"
      >
        <LuPlus size={18} />
      </button>

      <button
        type="button"
        className={buttonClass}
        onClick={actions.zoomOut}
        title="Zoom out"
      >
        <LuMinus size={18} />
      </button>

      <button
        type="button"
        className={`${buttonClass} rounded-full`}
        onClick={() => actions.flyTo([0, 0], 1)}
        title={`Bearing: ${Math.round(state.bearing)}°`}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          style={{
            transform: `rotate(${-state.bearing}deg)`,
            transition: "transform .1s",
          }}
          aria-hidden
        >
          <path d="M12 3 16 13H8z" fill="#ef4444" />
          <path d="M12 21 8 13h8z" fill="#94a3b8" />
        </svg>
      </button>
    </div>
  );
}
