"use client";

import { useViewState, useWorkspaceActions } from "../react/hooks";

export function ViewModeToggle() {
  const { is3D } = useViewState();
  const actions = useWorkspaceActions();

  return (
    <button
      type="button"
      onClick={() => void actions.set3D(!is3D)}
      className="absolute bottom-3 right-3 z-20 flex items-center gap-2.5 cursor-pointer rounded-full bg-surface-raised hover:bg-surface-raised-hover transition-colors py-1.5 pl-3 pr-1.5 text-xs font-semibold"
      aria-pressed={is3D}
    >
      3D
      <span className={`relative h-6 w-11 rounded-full transition-colors ${is3D ? "bg-action-primary" : "bg-surface-muted-hover"}`}>
        <span className={`absolute top-1 h-4 w-5 rounded-full bg-surface-raised transition-all ${is3D ? "left-5" : "left-1"}`} />
      </span>
    </button>
  );
}
