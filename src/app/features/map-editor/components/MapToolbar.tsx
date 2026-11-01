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
  {
    id: "rectangle" as const,
    icon: LuSquare,
    title: "Draw rectangle",
  },
];

export function MapToolbar() {
  const { state, actions } = useMapEditor();

  const buttonClass = (active: boolean) =>
    `flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-white/10 hover:text-white ${
      active ? "bg-white/10 text-white" : "text-slate-300"
    }`;

  return (
    <div
      className="absolute left-3 top-3 z-20 flex flex-col gap-1 rounded-xl bg-[#0e1726]/95 p-1.5 ring-1 ring-white/10"
      style={
        {
          "--level-color": "var(--map-yellow)",
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
          <Icon size={18} />
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
