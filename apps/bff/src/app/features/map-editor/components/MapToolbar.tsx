"use client";

import {
  LuMousePointer2,
  LuPen,
  LuRedo2,
  LuSquare,
  LuTrash2,
  LuUndo2,
} from "react-icons/lu";
import type { Tool } from "../core/schemas";
import {
  useEditorConfig,
  useWorkspaceActions,
  useWorkspaceOperations,
  useWorkspaceState,
} from "../react/hooks";
import { LevelSelector } from "./LevelSelector";

const TOOL_ICONS = {
  select: LuMousePointer2,
  polygon: LuPen,
  rectangle: LuSquare,
} as const;

export function MapToolbar() {
  const config = useEditorConfig();
  const { activeTool, activeLevel, selectedFeatureId, editableFeatureIds } =
    useWorkspaceState();
  const actions = useWorkspaceActions();
  const operations = useWorkspaceOperations();

  const levelColor = config.features.levels[activeLevel].color;
  const texts = config.ui.texts;
  const tools: Tool[] = [
    "select",
    ...config.drawing.tools.filter((t) => t !== "select"),
  ];
  const canDelete =
    config.permissions.delete &&
    selectedFeatureId !== null &&
    editableFeatureIds.has(selectedFeatureId);

  const buttonClass = (active: boolean) =>
    `flex h-9 w-9 items-center justify-center rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
      active
        ? "bg-(--level-color) text-background group"
        : "text-foreground hover:bg-surface-raised-hover"
    }`;

  return (
    <div
      className="absolute left-3 top-3 z-20 flex flex-col gap-1 rounded-xl bg-surface-raised p-1.5"
      style={{ "--level-color": levelColor } as React.CSSProperties}
    >
      {tools.map((tool) => {
        const Icon = TOOL_ICONS[tool];
        return (
          <button
            key={tool}
            type="button"
            className={buttonClass(activeTool === tool)}
            aria-pressed={activeTool === tool}
            disabled={tool !== "select" && !config.permissions.draw}
            onClick={() => void actions.setActiveTool(tool)}
            title={texts[tool]}
          >
            <Icon size={18} />
          </button>
        );
      })}

      <button
        type="button"
        className={buttonClass(false)}
        disabled={!canDelete}
        onClick={() =>
          selectedFeatureId && void operations.deleteFeature(selectedFeatureId)
        }
        title={texts.delete}
      >
        <LuTrash2 size={18} />
      </button>

      {config.ui.levelSelector && <LevelSelector />}

      {config.drawing.undoRedo && (
        <>
          <button
            type="button"
            className={buttonClass(false)}
            onClick={() => void actions.undo()}
            title={texts.undo}
          >
            <LuUndo2 size={18} />
          </button>
          <button
            type="button"
            className={buttonClass(false)}
            onClick={() => void actions.redo()}
            title={texts.redo}
          >
            <LuRedo2 size={18} />
          </button>
        </>
      )}
    </div>
  );
}
