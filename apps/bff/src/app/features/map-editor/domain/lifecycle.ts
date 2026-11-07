import type { EditorError } from "../core/errors";
import type {
  AreaFeature,
  DrawTool,
  Level,
  PolygonGeometry,
} from "../core/schemas";

/** Unsaved geometry drawn by the user. Its id is temporary and never a database id. */
export interface Draft {
  draftId: string;
  geometry: PolygonGeometry;
  level: Level;
  name: string;
  parentId: string | null;
}

export type Conflict =
  | { kind: "updated"; server: AreaFeature }
  | { kind: "deleted" };

/** Local, uncommitted edit of an existing feature. */
export interface EditSession {
  featureId: string;
  /** Canonical feature the edit started from. */
  base: AreaFeature;
  geometry: PolygonGeometry;
  conflict: Conflict | null;
}

export interface Failure {
  operation: "create" | "update" | "delete";
  error: EditorError;
  draft?: Draft;
  session?: EditSession;
  featureId?: string;
}

export type LifecycleState =
  | { status: "idle" }
  | { status: "drawing"; tool: DrawTool }
  | { status: "draft"; draft: Draft }
  | { status: "saving"; draft: Draft }
  | { status: "persisted"; featureId: string }
  | { status: "editing"; session: EditSession }
  | { status: "updating"; session: EditSession }
  | { status: "failed"; failure: Failure }
  | { status: "cancelled" };

export type LifecycleEvent =
  | { type: "drawing-started"; tool: DrawTool }
  | { type: "drawing-cancelled" }
  | { type: "draw-completed"; draft: Draft }
  | { type: "edit-changed"; base: AreaFeature; geometry: PolygonGeometry }
  | { type: "save-started" }
  | { type: "create-succeeded"; featureId: string }
  | { type: "update-succeeded"; featureId: string }
  | { type: "operation-failed"; error: EditorError }
  | { type: "delete-failed"; featureId: string; error: EditorError }
  | { type: "conflict-detected"; conflict: Conflict }
  | { type: "conflict-kept-local"; server: AreaFeature }
  | { type: "cancelled" };

export const initialLifecycle: LifecycleState = { status: "idle" };

const RESTING = new Set<LifecycleState["status"]>([
  "idle",
  "persisted",
  "cancelled",
]);

/** True when no draft, edit or failure is pending, i.e. a new session may start. */
export const isResting = (state: LifecycleState): boolean =>
  RESTING.has(state.status);

/** True while a request is in flight. */
export const isInFlight = (state: LifecycleState): boolean =>
  state.status === "saving" || state.status === "updating";

export function lifecycleReducer(
  state: LifecycleState,
  event: LifecycleEvent,
): LifecycleState {
  switch (event.type) {
    case "drawing-started":
      return isResting(state) || state.status === "drawing"
        ? { status: "drawing", tool: event.tool }
        : state;

    case "drawing-cancelled":
      return state.status === "drawing" ? { status: "cancelled" } : state;

    case "draw-completed":
      return state.status === "drawing" || isResting(state)
        ? { status: "draft", draft: event.draft }
        : state;

    case "edit-changed": {
      if (state.status === "editing") {
        return state.session.featureId === event.base.id
          ? {
              status: "editing",
              session: { ...state.session, geometry: event.geometry },
            }
          : state;
      }
      if (!isResting(state)) return state;
      return {
        status: "editing",
        session: {
          featureId: event.base.id,
          base: event.base,
          geometry: event.geometry,
          conflict: null,
        },
      };
    }

    case "save-started":
      if (state.status === "draft")
        return { status: "saving", draft: state.draft };
      if (state.status === "editing")
        return { status: "updating", session: state.session };
      if (state.status === "failed") {
        const { draft, session } = state.failure;
        if (draft) return { status: "saving", draft };
        if (session) return { status: "updating", session };
      }
      return state;

    case "create-succeeded":
      return state.status === "saving"
        ? { status: "persisted", featureId: event.featureId }
        : state;

    case "update-succeeded":
      return state.status === "updating"
        ? { status: "persisted", featureId: event.featureId }
        : state;

    case "operation-failed": {
      switch (state.status) {
        case "draft":
        case "saving":
          return {
            status: "failed",
            failure: {
              operation: "create",
              error: event.error,
              draft: state.draft,
            },
          };
        case "editing":
        case "updating":
          return {
            status: "failed",
            failure: {
              operation: "update",
              error: event.error,
              session: state.session,
            },
          };
        default:
          return state;
      }
    }

    case "delete-failed":
      return isResting(state)
        ? {
            status: "failed",
            failure: {
              operation: "delete",
              error: event.error,
              featureId: event.featureId,
            },
          }
        : state;

    case "conflict-detected":
      if (state.status === "editing" || state.status === "updating") {
        return {
          status: "editing",
          session: { ...state.session, conflict: event.conflict },
        };
      }
      if (state.status === "failed" && state.failure.session) {
        return {
          status: "failed",
          failure: {
            ...state.failure,
            session: { ...state.failure.session, conflict: event.conflict },
          },
        };
      }
      return state;

    case "conflict-kept-local": {
      // Rebase: the user's geometry will intentionally overwrite the newer server version.
      const rebase = (s: EditSession): EditSession => ({
        ...s,
        base: event.server,
        conflict: null,
      });
      if (state.status === "editing")
        return { status: "editing", session: rebase(state.session) };
      if (state.status === "failed" && state.failure.session) {
        return {
          status: "failed",
          failure: { ...state.failure, session: rebase(state.failure.session) },
        };
      }
      return state;
    }

    case "cancelled":
      return isInFlight(state) ? state : { status: "cancelled" };
  }
}

/** Draft ids the drawing engine must keep in its store (never removed by synchronization). */
export function retainedDraftIds(state: LifecycleState): ReadonlySet<string> {
  switch (state.status) {
    case "draft":
    case "saving":
      return new Set([state.draft.draftId]);
    case "failed":
      return state.failure.draft
        ? new Set([state.failure.draft.draftId])
        : EMPTY;
    default:
      return EMPTY;
  }
}

/** Feature ids whose geometry is currently owned by a local edit session. */
export function lockedFeatureIds(state: LifecycleState): ReadonlySet<string> {
  switch (state.status) {
    case "editing":
    case "updating":
      return new Set([state.session.featureId]);
    case "failed":
      return state.failure.session
        ? new Set([state.failure.session.featureId])
        : EMPTY;
    default:
      return EMPTY;
  }
}

export function activeSession(state: LifecycleState): EditSession | null {
  switch (state.status) {
    case "editing":
    case "updating":
      return state.session;
    case "failed":
      return state.failure.session ?? null;
    default:
      return null;
  }
}

export function activeDraft(state: LifecycleState): Draft | null {
  switch (state.status) {
    case "draft":
    case "saving":
      return state.draft;
    case "failed":
      return state.failure.draft ?? null;
    default:
      return null;
  }
}

/**
 * Detects that the canonical feature changed (or disappeared) while a local edit was open.
 * Versions are compared when available; otherwise the canonical geometry is compared.
 */
export function detectConflict(
  base: AreaFeature,
  current: AreaFeature | undefined,
  sameGeometry: (a: PolygonGeometry, b: PolygonGeometry) => boolean,
): Conflict | null {
  if (!current) return { kind: "deleted" };
  const { version: baseVersion } = base.properties;
  const { version: currentVersion } = current.properties;
  const changed =
    baseVersion !== undefined && currentVersion !== undefined
      ? baseVersion !== currentVersion
      : !sameGeometry(base.geometry, current.geometry);
  return changed ? { kind: "updated", server: current } : null;
}

const EMPTY: ReadonlySet<string> = new Set();
