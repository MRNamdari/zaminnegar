"use client";

import { LuLocateFixed, LuMinus, LuPlus } from "react-icons/lu";
import { useViewState, useWorkspaceActions } from "../react/hooks";

const buttonClass =
  "flex h-9 w-9 items-center justify-center rounded-lg bg-surface-raised hover:bg-surface-raised-hover transition-colors cursor-pointer";

export function MapControls() {
  const { bearing } = useViewState();
  const actions = useWorkspaceActions();

  const locate = () => {
    navigator.geolocation?.getCurrentPosition((position) => {
      void actions.flyTo([position.coords.longitude, position.coords.latitude], 16);
    });
  };

  return (
    <div className="absolute right-3 top-3 z-20 flex flex-col gap-2">
      <button type="button" className={buttonClass} onClick={locate} title="My location">
        <LuLocateFixed size={18} />
      </button>
      <button type="button" className={buttonClass} onClick={() => void actions.zoomIn()} title="Zoom in">
        <LuPlus size={18} />
      </button>
      <button type="button" className={buttonClass} onClick={() => void actions.zoomOut()} title="Zoom out">
        <LuMinus size={18} />
      </button>
      <button
        type="button"
        className={`${buttonClass} rounded-full`}
        onClick={() => void actions.resetBearing()}
        title={`Bearing: ${Math.round(bearing)}° (click to reset north)`}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          style={{ transform: `rotate(${-bearing}deg)`, transition: "transform .1s" }}
          aria-hidden
        >
          <path d="M12 3 16 13H8z" fill="#ef4444" />
          <path d="M12 21 8 13h8z" fill="#94a3b8" />
        </svg>
      </button>
    </div>
  );
}
