"use client";

import { useState } from "react";
import { LuLayers } from "react-icons/lu";

import { LEVELS } from "../config/levels";
import { useMapEditor } from "../context/useMapEditor";
import type { Level } from "../types";

export function LevelSelector() {
  const { state, actions } = useMapEditor();
  const [open, setOpen] = useState(false);

  const levels = Object.keys(LEVELS) as Level[];

  return (
    <>
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        title="Select level"
      >
        <LuLayers size={18} />
      </button>

      {open && (
        <div className="absolute left-16 top-3 z-30 flex w-36 flex-col gap-1.5 rounded-xl bg-[#0e1726]/95 p-1.5 text-sm text-slate-200 ring-1 ring-white/10">
          {levels.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => {
                actions.setActiveLevel(level);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-right hover:bg-white/10 ${
                state.activeLevel === level ? "bg-white/10" : ""
              }`}
            >
              <span
                className="h-3 w-3 rounded-sm"
                style={{
                  background: `var(${LEVELS[level].color})`,
                }}
              />
              {LEVELS[level].label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
