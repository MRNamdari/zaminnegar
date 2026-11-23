import { z } from "zod";
import { categoryTitles, conflictTitle, errorMessages, type ErrorMessages } from "./error-messages";

/**
 * Structured, discriminated errors. Every error has a `category` (coarse, for routing/reporting) and a `code`
 * (fine, for branching). Errors are plain data so they can be logged, serialised and compared.
 *
 * `message` is always the Persian, user-facing text, rendered from `core/error-messages.ts`: it is the only place
 * error wording lives, and the constructors below are the only way to make an error. Technical detail (ids, the
 * original exception) is carried in separate fields and is for logs, not for users.
 */

export type ValidationIssue = { path: string; message: string };

export type DomainError = {
  category: "domain";
  code: "feature_not_found" | "session_in_progress" | "no_active_session" | "invalid_state";
  message: string;
  featureId?: string;
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
  code: "draw_denied" | "create_denied" | "edit_denied" | "delete_denied" | "read_denied" | "tool_unavailable";
  message: string;
  featureId?: string;
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
  /** Technical context for logs, never shown. */
  detail?: string;
  cause?: unknown;
};
export type DrawEngineError = {
  category: "draw-engine";
  code: "init_failed" | "mode_failed" | "feature_rejected" | "command_failed";
  message: string;
  /** Technical context for logs, never shown. */
  detail?: string;
  cause?: unknown;
};
export type SyncError = {
  category: "synchronization";
  code: "apply_failed" | "unknown_feature";
  message: string;
  /** Technical context for logs, never shown. */
  detail?: string;
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

/* ------------------------------ constructors -------------------------------- */

type Entry = string | ((params: never) => string);
type ParamsOf<M> = M extends (params: infer P) => string ? P : unknown;
/** The parameters an entry needs (required only if it has a required one), plus what the error carries besides text. */
type Args<M, Extra> = {} extends ParamsOf<M> ? [params?: ParamsOf<M> & Extra] : [params: ParamsOf<M> & Extra];

const render = (entry: Entry, params: unknown): string =>
  typeof entry === "function" ? (entry as (params: unknown) => string)(params) : entry;

export const domainError = <K extends keyof ErrorMessages["domain"]>(
  code: K,
  ...args: Args<ErrorMessages["domain"][K], { featureId?: string }>
): DomainError => {
  const [params] = args as [{ featureId?: string }?];
  return {
    category: "domain",
    code,
    message: render(errorMessages.domain[code], params),
    ...(params?.featureId ? { featureId: params.featureId } : {}),
  };
};

export const validationError = <K extends keyof ErrorMessages["validation"]>(
  code: K,
  ...args: Args<ErrorMessages["validation"][K], { issues?: readonly ValidationIssue[] }>
): ValidationError => {
  const [params] = args as [{ issues?: readonly ValidationIssue[] }?];
  return {
    category: "validation",
    code,
    message: render(errorMessages.validation[code], params),
    issues: params?.issues ?? [],
  };
};

export const permissionError = <K extends keyof ErrorMessages["permission"]>(
  code: K,
  ...args: Args<ErrorMessages["permission"][K], { featureId?: string }>
): PermissionError => {
  const [params] = args as [{ featureId?: string }?];
  return {
    category: "permission",
    code,
    message: render(errorMessages.permission[code], params),
    ...(params?.featureId ? { featureId: params.featureId } : {}),
  };
};

export const applicationError = <K extends keyof ErrorMessages["application"]>(
  code: K,
  ...args: Args<ErrorMessages["application"][K], { featureId?: string | undefined }>
): ApplicationError => {
  const [params] = args as [{ featureId?: string }?];
  return {
    category: "application",
    code,
    message: render(errorMessages.application[code], params),
    ...(params?.featureId ? { featureId: params.featureId } : {}),
  };
};

export const networkError = <K extends keyof ErrorMessages["network"]>(
  code: K,
  ...args: Args<ErrorMessages["network"][K], { status?: number; retryable?: boolean }>
): NetworkError => {
  const [params] = args as [{ status?: number; retryable?: boolean }?];
  return {
    category: "network",
    code,
    message: render(errorMessages.network[code], params),
    retryable: params?.retryable ?? code !== "invalid_response",
    ...(params?.status !== undefined ? { status: params.status } : {}),
  };
};

type EngineExtra = { cause?: unknown; detail?: string };

export const mapEngineError = <K extends keyof ErrorMessages["map-engine"]>(
  code: K,
  ...args: Args<ErrorMessages["map-engine"][K], EngineExtra>
): MapEngineError => {
  const [params] = args as [EngineExtra?];
  return {
    category: "map-engine",
    code,
    message: render(errorMessages["map-engine"][code], params),
    ...(params?.detail !== undefined ? { detail: params.detail } : {}),
    cause: params?.cause,
  };
};

export const drawEngineError = <K extends keyof ErrorMessages["draw-engine"]>(
  code: K,
  ...args: Args<ErrorMessages["draw-engine"][K], EngineExtra>
): DrawEngineError => {
  const [params] = args as [EngineExtra?];
  return {
    category: "draw-engine",
    code,
    message: render(errorMessages["draw-engine"][code], params),
    ...(params?.detail !== undefined ? { detail: params.detail } : {}),
    cause: params?.cause,
  };
};

export const syncError = <K extends keyof ErrorMessages["synchronization"]>(
  code: K,
  ...args: Args<ErrorMessages["synchronization"][K], EngineExtra>
): SyncError => {
  const [params] = args as [EngineExtra?];
  return {
    category: "synchronization",
    code,
    message: render(errorMessages.synchronization[code], params),
    ...(params?.detail !== undefined ? { detail: params.detail } : {}),
    cause: params?.cause,
  };
};

/**
 * Schema-validation issues for `validationError(..., { issues })`, with Persian messages. Zod checked the data
 * with its default (English) wording; the issues are re-rendered here so no call site deals with language.
 */
const zodMessage = z.locales.fa().localeError;
export function issuesFromZod(error: {
  issues: readonly (z.core.$ZodIssue)[];
}): ValidationIssue[] {
  return error.issues.map((issue) => {
    const localized = zodMessage(issue as never);
    return {
      path: issue.path.join("."),
      message: typeof localized === "string" ? localized : (localized?.message ?? issue.message),
    };
  });
}

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

/** User-facing summary: a heading for the category and the error's own (Persian) message. */
export function describeError(error: EditorError): { title: string; message: string; retryable: boolean } {
  return {
    title: isConflict(error) ? conflictTitle : categoryTitles[error.category],
    message: error.message,
    retryable: isRetryable(error),
  };
}

/** Pluggable reporting hook; the default implementation logs to the console. */
export type ErrorReporter = (error: EditorError, context: { operation: string }) => void;

export const consoleErrorReporter: ErrorReporter = (error, { operation }) => {
  console.error(`[map-editor] ${operation}: ${error.category}/${error.code} - ${error.message}`, error);
};
