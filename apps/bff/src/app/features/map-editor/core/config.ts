import { err, ok, type Result } from "neverthrow";
import { z } from "zod";
import { validationError, type ValidationError } from "./errors";
import { LEVELS, levelSchema, toolSchema, type Level } from "./schemas";

const lngLat = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-90).max(90),
]);

export type NamingContext = { level: Level; label: string; index: number };
export type NamingStrategy = (context: NamingContext) => string;
const namingSchema = z.custom<NamingStrategy>(
  (value) => typeof value === "function",
  "Expected a function",
);

const levelStyle = z.object({ label: z.string(), color: z.string().min(1) });

/**
 * Editor configuration. Every field has a default, so callers pass a deep partial.
 * Colors accept any CSS color or `var(--token)`, resolved by the engine at runtime.
 */
export const editorConfigSchema = z.object({
  map: z
    .object({
      center: lngLat.default([59.679098, 36.211555]),
      zoom: z.number().min(0).max(24).default(13.5),
      minZoom: z.number().min(0).max(24).default(0),
      maxZoom: z.number().min(0).max(24).default(22),
      bounds: z
        .tuple([z.number(), z.number(), z.number(), z.number()])
        .optional(),
      basemap: z.enum(["satellite", "streets"]).default("satellite"),
      /** Overrides `basemap` with a remote MapLibre style document. */
      styleUrl: z.url().optional(),
      projection: z.enum(["mercator", "globe"]).default("mercator"),
      terrain: z
        .object({
          enabled: z.boolean().default(true),
          exaggeration: z.number().positive().default(1.3),
          pitch: z.number().min(0).max(85).default(60),
        })
        .prefault({}),
      interactions: z
        .object({
          scrollZoom: z.boolean().default(true),
          dragRotate: z.boolean().default(true),
          keyboard: z.boolean().default(true),
        })
        .prefault({}),
    })
    .prefault({}),
  drawing: z
    .object({
      /** Tools exposed in the toolbar. `select` is always available. */
      tools: z.array(toolSchema).default(["select", "polygon"]),
      defaultTool: toolSchema.default("select"),
      undoRedo: z.boolean().default(true),
      /** Send a finished drawing straight to the create operation. When false the user confirms with Save. */
      autoSaveDrafts: z.boolean().default(true),
      keys: z
        .object({
          finish: z.string().default("Enter"),
          cancel: z.string().default("Escape"),
        })
        .prefault({}),
      styles: z
        .object({
          fillOpacity: z.number().min(0).max(1).default(0.3),
          outlineWidth: z.number().positive().default(2),
          selectedFillOpacity: z.number().min(0).max(1).default(0.35),
          selectedOutlineWidth: z.number().positive().default(3),
        })
        .prefault({}),
    })
    .prefault({}),
  features: z
    .object({
      levels: z.record(levelSchema, levelStyle).default({
        region: { label: "منطقه", color: "#22c55e" },
        block: { label: "بلوک", color: "#3b82f6" },
        parcel: { label: "قطعه", color: "#facc15" },
      }),
      selectedColor: z.string().default("#a855f7"),
      defaultLevel: levelSchema.default("parcel"),
      labels: z
        .object({
          enabled: z.boolean().default(true),
          hiddenLevels: z.array(levelSchema).default(["parcel"]),
        })
        .prefault({}),
      /** Which levels may contain a feature of a given level (used to suggest `parentId`). */
      hierarchy: z
        .record(levelSchema, z.array(levelSchema))
        .default({
          region: [],
          block: ["region"],
          parcel: ["block", "region"],
        }),
      validation: z
        .object({ minAreaM2: z.number().nonnegative().default(1) })
        .prefault({}),
      naming: namingSchema.optional(),
    })
    .prefault({}),
  ui: z
    .object({
      toolbar: z.boolean().default(true),
      controls: z.boolean().default(true),
      minimap: z.boolean().default(true),
      viewModeToggle: z.boolean().default(true),
      levelSelector: z.boolean().default(true),
      statusBar: z.boolean().default(true),
      texts: z
        .object({
          loading: z.string().default("در حال بارگذاری نقشه…"),
          select: z.string().default("Select and edit"),
          polygon: z.string().default("Draw polygon"),
          rectangle: z.string().default("Draw rectangle"),
          delete: z.string().default("Delete selected feature"),
          undo: z.string().default("Undo"),
          redo: z.string().default("Redo"),
          save: z.string().default("Save changes"),
          cancel: z.string().default("Cancel"),
          retry: z.string().default("Retry"),
        })
        .prefault({}),
    })
    .prefault({}),
  permissions: z
    .object({
      draw: z.boolean().default(true),
      create: z.array(levelSchema).default([...LEVELS]),
      edit: z.boolean().default(true),
      delete: z.boolean().default(true),
    })
    .prefault({}),
});

export type EditorConfig = z.output<typeof editorConfigSchema>;

type DeepPartial<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly unknown[]
    ? T
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T;

/** What callers pass: any subset of the configuration. */
export type EditorConfigInput = DeepPartial<z.input<typeof editorConfigSchema>>;

export function resolveEditorConfig(
  input: EditorConfigInput = {},
): Result<EditorConfig, ValidationError> {
  const parsed = editorConfigSchema.safeParse(input);
  if (parsed.success) return ok(parsed.data);
  return err(
    validationError(
      "invalid_config",
      "Editor configuration is invalid",
      parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    ),
  );
}

/** Defaults, used as a fallback when a supplied configuration is invalid. */
export const DEFAULT_EDITOR_CONFIG: EditorConfig = editorConfigSchema.parse({});
