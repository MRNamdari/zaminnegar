import { TypedStatusError } from "@zaminnegar/api-client";
import { z } from "zod";
import {
  applicationError,
  domainError,
  networkError,
  permissionError,
  validationError,
  type EditorError,
  type NetworkError,
  type PermissionError,
  type ValidationIssue,
} from "../../core/errors";

/**
 * Anti-corruption layer for failures. Everything the generated client (or anything
 * beneath it) can throw is translated here into an `EditorError`; nothing from the
 * transport (HTTP exceptions, Zod errors, backend envelopes) crosses into the editor.
 *
 * User-facing messages are fixed strings. Backend detail (status, machine code, raw
 * message, the original exception) goes to the diagnostics channel instead, so it
 * can be logged without being shown.
 */

export type GatewayOperation = "create" | "update" | "delete";
export type GatewayStep = "write" | "load-boundary" | "rollback";

export type ErrorContext = {
  operation: GatewayOperation;
  step: GatewayStep;
  /** Known once the feature exists on, or was addressed to, the backend. */
  featureId?: string | undefined;
};

/** Everything useful for debugging that must not be shown to users. */
export type GatewayDiagnostic = ErrorContext & {
  status?: number;
  backendCode?: string;
  backendMessage?: string;
  cause: unknown;
};

export type TranslatedError = { error: EditorError; diagnostic: GatewayDiagnostic };

/** Backend envelopes: `ErrorResponseDto` and `ValidationErrorResponseDto`, read defensively. */
const backendErrorBodySchema = z.looseObject({
  code: z.string().optional(),
  message: z.union([z.string(), z.array(z.string())]).optional(),
  retryAfterSeconds: z.number().optional(),
});

type BackendErrorBody = {
  code?: string;
  messages: readonly string[];
  retryAfterSeconds?: number;
};

function readBackendBody(data: unknown): BackendErrorBody {
  const parsed = backendErrorBodySchema.safeParse(data);
  if (!parsed.success) return { messages: [] };
  const { code, message, retryAfterSeconds } = parsed.data;
  return {
    messages: message === undefined ? [] : Array.isArray(message) ? message : [message],
    ...(code !== undefined ? { code } : {}),
    ...(retryAfterSeconds !== undefined ? { retryAfterSeconds } : {}),
  };
}

const DENIED_CODE = {
  create: "create_denied",
  update: "edit_denied",
  delete: "delete_denied",
} as const satisfies Record<GatewayOperation, PermissionError["code"]>;

const VERB = { create: "create", update: "edit", delete: "delete" } as const satisfies Record<GatewayOperation, string>;

/** The backend answered, but with a payload this gateway cannot trust or use. Not retryable. */
export function invalidResponse(what: string): NetworkError {
  return networkError("invalid_response", `The backend returned an invalid ${what}`, { retryable: false });
}

function fromStatus(status: number, body: BackendErrorBody, ctx: ErrorContext): EditorError {
  const { operation, featureId } = ctx;

  switch (status) {
    case 400:
    case 422: {
      // Validation messages are authored for display and carry no internals.
      const issues: ValidationIssue[] = body.messages.map((message) => ({ path: "", message }));
      return validationError("invalid_schema", "The backend rejected the data as invalid", issues);
    }
    case 401:
      return permissionError(DENIED_CODE[operation], "Your session is missing or has expired. Sign in again.");
    case 403:
      return permissionError(DENIED_CODE[operation], `You do not have permission to ${VERB[operation]} this feature`);
    case 404:
      return featureId !== undefined
        ? domainError("feature_not_found", `Feature ${featureId} was not found on the server`)
        : applicationError("rejected", "The requested resource was not found");
    case 409:
      // 409 is also used for "no active project", which is not an edit conflict and must not
      // open the editor's conflict-resolution flow.
      return body.code === "NO_ACTIVE_PROJECT"
        ? applicationError("rejected", "No active project is selected", featureId)
        : applicationError("conflict", "The change conflicts with the current state on the server", featureId);
    case 408:
      return networkError("timeout", "The request timed out", { status, retryable: true });
    case 429:
      return networkError(
        "http",
        body.retryAfterSeconds !== undefined
          ? `Too many requests. Try again in ${Math.ceil(body.retryAfterSeconds)} seconds`
          : "Too many requests. Try again shortly",
        { status, retryable: true },
      );
    default:
      return status >= 500
        ? networkError("http", "The server failed to process the request", { status, retryable: true })
        : applicationError("rejected", `The backend rejected the request (HTTP ${status})`, featureId);
  }
}

/** By name, not `instanceof`: a `DOMException` from another realm (iframe, jsdom) is not an `Error` of ours. */
const isAbort = (cause: unknown): boolean => typeof cause === "object" && cause !== null && "name" in cause && cause.name === "AbortError";

/** Translates anything thrown while talking to the backend. Never throws, never swallows. */
export function translateApiError(cause: unknown, ctx: ErrorContext): TranslatedError {
  const diagnostic = (extra: Partial<GatewayDiagnostic> = {}): GatewayDiagnostic => ({ ...ctx, ...extra, cause });

  if (cause instanceof TypedStatusError) {
    const body = readBackendBody(cause.response.data);
    return {
      error: fromStatus(cause.status, body, ctx),
      diagnostic: diagnostic({
        status: cause.status,
        ...(body.code !== undefined ? { backendCode: body.code } : {}),
        ...(body.messages.length > 0 ? { backendMessage: body.messages.join("; ") } : {}),
      }),
    };
  }
  // The generated client validates both what it sends and what it receives.
  if (cause instanceof z.ZodError) {
    return { error: invalidResponse("response"), diagnostic: diagnostic({ backendMessage: cause.message }) };
  }
  if (isAbort(cause)) {
    return { error: networkError("timeout", "The request was cancelled", { retryable: true }), diagnostic: diagnostic() };
  }
  // `fetch` rejects with a TypeError when the network is unreachable.
  if (cause instanceof TypeError) {
    return { error: networkError("offline", "The backend could not be reached", { retryable: true }), diagnostic: diagnostic() };
  }
  return { error: applicationError("operation_failed", "The operation failed unexpectedly", ctx.featureId), diagnostic: diagnostic() };
}
