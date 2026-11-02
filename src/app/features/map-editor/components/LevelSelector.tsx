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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 07d86ce (style: format map editor and global styles)
      <div
        id={popoverId}
        popover="auto"
        style={{
          position: "fixed",
          positionAnchor: `--level-selector-anchor`,
<<<<<<< HEAD
          positionArea: "x-start span-top",
=======
          positionArea: "x-end span-top",
>>>>>>> 07d86ce (style: format map editor and global styles)
          positionTryFallbacks: "flip-block,flip-inline,flip-block flip-inline",
          inset: "0 1rem",
        }}
        className="rounded-xl bg-surface p-1.5 text-sm"
      >
        <div className="flex flex-col gap-1.5">
<<<<<<< HEAD
=======

      {open && (
        <div className="absolute left-16 top-3 z-30 flex w-36 flex-col gap-1.5 rounded-xl bg-[#0e1726]/95 p-1.5 text-sm text-slate-200 ring-1 ring-white/10">
>>>>>>> 9b29d75 (refactor: re-imlpement map editor)
=======
>>>>>>> 07d86ce (style: format map editor and global styles)
          {levels.map((level) => (
            <button
              key={level}
              type="button"
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
=======
              aria-disabled={state.activeLevel === level}
>>>>>>> 07d86ce (style: format map editor and global styles)
              onClick={() => {
                actions.setActiveLevel(level);
              }}
              popoverTarget={popoverId}
              popoverTargetAction="hide"
              className={`flex w-full items-center justify-between gap-6 not-aria-disabled:cursor-pointer transition-colors rounded-lg px-2.5 py-2 font-bold hover:bg-surface-hover aria-disabled:bg-surface-muted-hover`}
            >
              <span
<<<<<<< HEAD
                className="h-3 w-3 rounded-sm"
>>>>>>> 9b29d75 (refactor: re-imlpement map editor)
=======
                className="h-4 w-4 rounded-sm"
>>>>>>> 07d86ce (style: format map editor and global styles)
                style={{
                  background: `var(${LEVELS[level].color})`,
                }}
              />
              {LEVELS[level].label}
            </button>
          ))}
        </div>
<<<<<<< HEAD
<<<<<<< HEAD
      </div>
=======
      )}
>>>>>>> 9b29d75 (refactor: re-imlpement map editor)
=======
      </div>
>>>>>>> 07d86ce (style: format map editor and global styles)
    </>
  );
}
