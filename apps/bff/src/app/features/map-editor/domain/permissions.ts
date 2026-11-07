import { err, ok, type Result } from "neverthrow";
import type { EditorConfig } from "../core/config";
import { permissionError, type PermissionError } from "../core/errors";
import type { Level, Tool } from "../core/schemas";

type PermissionConfig = EditorConfig["permissions"];

export function checkTool(config: PermissionConfig, enabledTools: readonly Tool[], tool: Tool): Result<Tool, PermissionError> {
  if (tool === "select") return ok(tool);
  if (!config.draw) return err(permissionError("draw_denied", "Drawing is disabled"));
  if (!enabledTools.includes(tool)) return err(permissionError("tool_unavailable", `Tool "${tool}" is not enabled`));
  return ok(tool);
}

export function checkCreate(config: PermissionConfig, level: Level): Result<Level, PermissionError> {
  if (!config.draw) return err(permissionError("draw_denied", "Drawing is disabled"));
  if (!config.create.includes(level)) return err(permissionError("create_denied", `Creating "${level}" features is not allowed`));
  return ok(level);
}

/**
 * A feature is editable only when editing is globally allowed AND the application
 * listed it in `editableFeatureIds`. A global mode never makes every feature editable.
 */
export function isFeatureEditable(config: PermissionConfig, editableIds: ReadonlySet<string>, id: string): boolean {
  return config.edit && editableIds.has(id);
}

export function checkEdit(config: PermissionConfig, editableIds: ReadonlySet<string>, id: string): Result<string, PermissionError> {
  return isFeatureEditable(config, editableIds, id) ? ok(id) : err(permissionError("edit_denied", `Feature ${id} is not editable`));
}

export function checkDelete(config: PermissionConfig, editableIds: ReadonlySet<string>, id: string): Result<string, PermissionError> {
  if (!config.delete || !editableIds.has(id)) return err(permissionError("delete_denied", `Feature ${id} cannot be deleted`));
  return ok(id);
}
