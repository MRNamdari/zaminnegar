"use client";

import { useId } from "react";
import { LuLayers } from "react-icons/lu";
import { LEVELS } from "../core/schemas";
import { useEditorConfig, useWorkspaceActions, useWorkspaceState } from "../react/hooks";

export function LevelSelector() {
  const config = useEditorConfig();
  const { activeLevel } = useWorkspaceState();
  const actions = useWorkspaceActions();
  const popoverId = useId();
  const anchorName = `--level-anchor-${popoverId.replace(/:/g, "")}`;

  return (
    <>
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-surface-raised-hover cursor-pointer"
        style={{ color: config.features.levels[activeLevel].color, anchorName } as React.CSSProperties}
        popoverTarget={popoverId}
        popoverTargetAction="toggle"
        title="Select level"
      >
        <LuLayers size={18} />
      </button>
      <div
        id={popoverId}
        popover="auto"
        style={
          {
            position: "fixed",
            positionAnchor: anchorName,
            positionArea: "x-start span-top",
            positionTryFallbacks: "flip-block,flip-inline,flip-block flip-inline",
            inset: "0 1rem",
          } as React.CSSProperties
        }
        className="rounded-xl bg-surface p-1.5 text-sm"
      >
        <div className="flex flex-col gap-1.5">
          {LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              aria-disabled={activeLevel === level}
              onClick={() => actions.setActiveLevel(level)}
              popoverTarget={popoverId}
              popoverTargetAction="hide"
              className="flex w-full items-center justify-between gap-6 not-aria-disabled:cursor-pointer transition-colors rounded-lg px-2.5 py-2 font-bold hover:bg-surface-hover aria-disabled:bg-surface-muted-hover"
            >
              <span className="h-4 w-4 rounded-sm" style={{ background: config.features.levels[level].color }} />
              {config.features.levels[level].label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
