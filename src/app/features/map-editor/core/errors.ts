/**
 * Structured, discriminated errors. Every error has a `category` (coarse, for
 * routing/reporting) and a `code` (fine, for branching). Errors are plain data so
 * they can be logged, serialised and compared.
 */

export type ValidationIssue = { path: string; message: string };

export type DomainError = {
  category: "domain";
  code: "feature_not_found" | "session_in_progress" | "no_active_session" | "invalid_state";
  message: string;
};
export type ValidationError = {
  category: "validation";
  code:
    | "invalid_schema"
    | "invalid_geometry"
    | "unclosed_ring"
    | "self_intersection"
    | "area_too_small"
    | "invalid_config";
  message: string;
  issues: readonly ValidationIssue[];
};
export type PermissionError = {
  category: "permission";
  code: "draw_denied" | "create_denied" | "edit_denied" | "delete_denied" | "tool_unavailable";
  message: string;
};
export type ApplicationError = {
  category: "application";
  code: "conflict" | "operation_failed" | "rejected";
  message: string;
  featureId?: string;
};
export type NetworkError = {
  category: "network";
  code: "http" | "offline" | "timeout" | "invalid_response";
  message: string;
  status?: number;
  retryable: boolean;
};
export type MapEngineError = {
  category: "map-engine";
  code: "not_ready" | "init_failed" | "command_failed";
  message: string;
  cause?: unknown;
};
export type DrawEngineError = {
  category: "draw-engine";
  code: "init_failed" | "mode_failed" | "feature_rejected" | "command_failed";
  message: string;
  cause?: unknown;
};
export type SyncError = {
  category: "synchronization";
  code: "apply_failed" | "unknown_feature";
  message: string;
  cause?: unknown;
};

export type EditorError =
  | DomainError
  | ValidationError
  | PermissionError
  | ApplicationError
  | NetworkError
  | MapEngineError
  | DrawEngineError
  | SyncError;

export type ErrorCategory = EditorError["category"];

export const domainError = (code: DomainError["code"], message: string): DomainError => ({
  category: "domain",
  code,
  message,
});
export const validationError = (
  code: ValidationError["code"],
  message: string,
  issues: readonly ValidationIssue[] = [],
): ValidationError => ({ category: "validation", code, message, issues });
export const permissionError = (code: PermissionError["code"], message: string): PermissionError => ({
  category: "permission",
  code,
  message,
});
export const applicationError = (
  code: ApplicationError["code"],
  message: string,
  featureId?: string,
): ApplicationError => ({ category: "application", code, message, ...(featureId ? { featureId } : {}) });
export const networkError = (
  code: NetworkError["code"],
  message: string,
  options: { status?: number; retryable?: boolean } = {},
): NetworkError => ({
  category: "network",
  code,
  message,
  retryable: options.retryable ?? code !== "invalid_response",
  ...(options.status !== undefined ? { status: options.status } : {}),
});
export const mapEngineError = (code: MapEngineError["code"], message: string, cause?: unknown): MapEngineError => ({
  category: "map-engine",
  code,
  message,
  cause,
});
export const drawEngineError = (code: DrawEngineError["code"], message: string, cause?: unknown): DrawEngineError => ({
  category: "draw-engine",
  code,
  message,
  cause,
});
export const syncError = (code: SyncError["code"], message: string, cause?: unknown): SyncError => ({
  category: "synchronization",
  code,
  message,
  cause,
});

/** Whether retrying the same operation could plausibly succeed. */
export function isRetryable(error: EditorError): boolean {
  switch (error.category) {
    case "network":
      return error.retryable;
    case "application":
      return error.code === "operation_failed";
    case "synchronization":
    case "draw-engine":
    case "map-engine":
      return true;
    default:
      return false;
  }
}

export function isConflict(error: EditorError): boolean {
  return error.category === "application" && error.code === "conflict";
}

/** User-facing summary. Presentation layers may translate or replace it. */
export function describeError(error: EditorError): { title: string; message: string; retryable: boolean } {
  const titles: Record<ErrorCategory, string> = {
    domain: "Action not possible",
    validation: "Invalid geometry or data",
    permission: "Not allowed",
    application: isConflict(error) ? "Edit conflict" : "Operation failed",
    network: "Network problem",
    "map-engine": "Map error",
    "draw-engine": "Drawing error",
    synchronization: "Synchronization error",
  };
  return { title: titles[error.category], message: error.message, retryable: isRetryable(error) };
}

/** Pluggable reporting hook; the default implementation logs to the console. */
export type ErrorReporter = (error: EditorError, context: { operation: string }) => void;

export const consoleErrorReporter: ErrorReporter = (error, { operation }) => {
  console.error(`[map-editor] ${operation}: ${error.category}/${error.code} - ${error.message}`, error);
};
