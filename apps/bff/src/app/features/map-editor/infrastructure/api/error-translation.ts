import { TypedStatusError } from "@zaminnegar/api-client";
import { z } from "zod";
import { backendMessage, GEOMETRY_RULE_CODES } from "../../core/error-messages";
import {
  applicationError,
  domainError,
  networkError,
  permissionError,
  validationError,
  type EditorError,
  type NetworkError,
  type PermissionError,
} from "../../core/errors";

/**
 * Anti-corruption layer for failures. Everything the generated client (or anything
 * beneath it) can throw is translated here into an `EditorError`; nothing from the
 * transport (HTTP exceptions, Zod errors, backend envelopes) crosses into the editor.
 *
 * User-facing text comes from the central catalog (`core/error-messages.ts`), chosen by status and
 * backend `code`. Backend detail (status, machine code, raw message, the original exception) goes to
 * the diagnostics channel instead, so it can be logged without being shown.
 */

export type GatewayOperation = "create" | "update" | "delete" | "read";

export type ErrorContext = {
  operation: GatewayOperation;
  /** Known once the request is addressed to an existing feature. */
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
  read: "read_denied",
} as const satisfies Record<GatewayOperation, PermissionError["code"]>;

/** The backend answered, but with a payload this gateway cannot trust or use. Not retryable. */
export function invalidResponse(): NetworkError {
  return networkError("invalid_response", { retryable: false });
}

/**
 * Chooses the editor error for an HTTP failure. The status picks the kind of error; the backend's `code`, when the
 * catalog knows it, picks the text (a taken name, an overlap, a region that is not empty...). The wording itself is
 * never here: it lives in `core/error-messages.ts`.
 */
function fromStatus(status: number, body: BackendErrorBody, ctx: ErrorContext): EditorError {
  const { operation, featureId } = ctx;
  const backendCode = body.code;
  const known = backendMessage(backendCode) !== undefined;

  switch (status) {
    case 400:
    case 422:
      // A named geometry rule is invalid geometry; another named refusal is a rejection; the rest is malformed data.
      if (backendCode !== undefined && GEOMETRY_RULE_CODES.has(backendCode)) {
        return validationError("invalid_geometry", { backendCode });
      }
      if (known) return applicationError("rejected", { backendCode, featureId });
      // The backend's validation messages are English detail for logs, not shown.
      return validationError("invalid_schema", {
        subject: "backend_rejected",
        issues: body.messages.map((message) => ({ path: "", message })),
      });
    case 401:
      return permissionError(DENIED_CODE[operation], { session: "expired", featureId });
    case 403:
      return permissionError(DENIED_CODE[operation], { backendCode, featureId });
    case 404:
      return featureId !== undefined
        ? domainError("feature_not_found", { featureId })
        : applicationError("rejected", { reason: "not_found", backendCode });
    case 409:
      // 409 carries many named refusals (no active project, name taken, overlap, not empty). They are rejections,
      // not edit conflicts, and must not open the editor's conflict-resolution flow; only an unnamed 409 is a conflict.
      return known
        ? applicationError("rejected", { backendCode, featureId })
        : applicationError("conflict", { featureId });
    case 408:
      return networkError("timeout", { status, retryable: true });
    case 429:
      return networkError("http", {
        reason: "rate_limited",
        status,
        retryable: true,
        ...(body.retryAfterSeconds !== undefined ? { retryAfterSeconds: body.retryAfterSeconds } : {}),
      });
    default:
      return status >= 500
        ? networkError("http", { reason: "server_error", status, retryable: true })
        : applicationError("rejected", { status, backendCode, featureId });
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
    return { error: invalidResponse(), diagnostic: diagnostic({ backendMessage: cause.message }) };
  }
  if (isAbort(cause)) {
    return { error: networkError("timeout", { reason: "cancelled", retryable: true }), diagnostic: diagnostic() };
  }
  // `fetch` rejects with a TypeError when the network is unreachable.
  if (cause instanceof TypeError) {
    return { error: networkError("offline", { retryable: true }), diagnostic: diagnostic() };
  }
  return { error: applicationError("operation_failed", { featureId: ctx.featureId }), diagnostic: diagnostic() };
}
