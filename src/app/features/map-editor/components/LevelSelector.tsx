"use client";

import { useId, useState } from "react";
import { LuLayers } from "react-icons/lu";

import { LEVELS } from "../config/levels";
import { useMapEditor } from "../context/useMapEditor";
import type { Level } from "../types";

export function LevelSelector() {
  const { state, actions } = useMapEditor();

  const anchorId = useId();
  const popoverId = useId();

  const levels = Object.keys(LEVELS) as Level[];

  return (
    <>
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-surface-raised-hover cursor-pointer"
        style={{
          color: `var(${LEVELS[state.activeLevel].color})`,
          anchorName: "--level-selector-anchor",
        }}
        id={anchorId}
        popoverTarget={popoverId}
        popoverTargetAction="toggle"
        title="Select level"
      >
        <LuLayers size={18} />
      </button>
      <div
        id={popoverId}
        popover="auto"
        style={{
          position: "fixed",
          positionAnchor: `--level-selector-anchor`,
          positionArea: "x-end span-top",
          positionTryFallbacks: "flip-block,flip-inline,flip-block flip-inline",
          inset: "0 1rem",
        }}
        className="rounded-xl bg-surface p-1.5 text-sm"
      >
        <div className="flex flex-col gap-1.5">
          {levels.map((level) => (
            <button
              key={level}
              type="button"
              aria-disabled={state.activeLevel === level}
              onClick={() => {
                actions.setActiveLevel(level);
              }}
              popoverTarget={popoverId}
              popoverTargetAction="hide"
              className={`flex w-full items-center justify-between gap-6 not-aria-disabled:cursor-pointer transition-colors rounded-lg px-2.5 py-2 font-bold hover:bg-surface-hover aria-disabled:bg-surface-muted-hover`}
            >
              <span
                className="h-4 w-4 rounded-sm"
                style={{
                  background: `var(${LEVELS[level].color})`,
                }}
              />
              {LEVELS[level].label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
