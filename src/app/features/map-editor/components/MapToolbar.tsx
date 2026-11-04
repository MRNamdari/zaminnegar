"use client";

import {
  LuMousePointer2,
  LuPen,
  LuSquare,
  LuTrash2,
  LuLayers,
  LuUndo2,
  LuRedo2,
} from "react-icons/lu";

import { useMapEditor } from "../context/useMapEditor";

import { LevelSelector } from "./LevelSelector";
import { LEVELS } from "../config/levels";

const tools = [
  {
    id: "select" as const,
    icon: LuMousePointer2,
    title: "Select and edit",
  },
  {
    id: "polygon" as const,
    icon: LuPen,
    title: "Draw polygon",
  },
];

export function MapToolbar() {
  const { state, actions } = useMapEditor();

  const buttonClass = (active: boolean) =>
    `flex h-9 w-9 items-center justify-center rounded-lg cursor-pointer transition-colors ${
      active
        ? "bg-(--level-color) hover:bg-(--level-color-hover) text-background group"
        : "text-foreground hover:bg-surface-raised-hover"
    }`;

  return (
    <div
      className="absolute left-3 top-3 z-20 flex flex-col gap-1 rounded-xl bg-surface-raised p-1.5"
      style={
        {
          "--level-color": `var(${LEVELS[state.activeLevel].color})`,
          "--level-color-hover": `var(${LEVELS[state.activeLevel].color}-hover)`,
        } as React.CSSProperties
      }
    >
      {tools.map(({ id, icon: Icon, title }) => (
        <button
          key={id}
          type="button"
          className={buttonClass(state.activeTool === id)}
          aria-pressed={state.activeTool === id}
          onClick={() => actions.setActiveTool(id)}
          title={title}
        >
          <Icon size={18} className="group-aria-pressed:stroke-3" />
        </button>
      ))}

      <button
        type="button"
        className={buttonClass(false)}
        onClick={actions.deleteSelectedFeature}
        title="Delete selected feature"
      >
        <LuTrash2 size={18} />
      </button>

      <LevelSelector />

      <button
        type="button"
        className={buttonClass(false)}
        onClick={actions.undo}
        title="Undo"
      >
        <LuUndo2 size={18} />
      </button>

      <button
        type="button"
        className={buttonClass(false)}
        onClick={actions.redo}
        title="Redo"
      >
        <LuRedo2 size={18} />
      </button>
    </div>
  );
}
