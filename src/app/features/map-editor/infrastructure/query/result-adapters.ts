import { err as errResult, ok as okResult, ResultAsync, type Result } from "neverthrow";
import type { z } from "zod";
import { networkError, validationError, type EditorError } from "../../core/errors";

/**
 * TanStack Query treats a *rejected promise* as failure. These adapters keep that
 * contract: an `Err` is converted to a rejection (never returned as a "successful" value)
 * and rejections are converted back to typed errors at the edge.
 */
export class EditorFailure extends Error {
  constructor(readonly error: EditorError) {
    super(error.message);
    this.name = "EditorFailure";
  }
}

/** For `queryFn` / `mutationFn`: resolves with the value or rejects with `EditorFailure`. */
export function toPromise<T>(result: ResultAsync<T, EditorError>): Promise<T> {
  return result.match(
    (value) => value,
    (error) => {
      throw new EditorFailure(error);
    },
  );
}

/** Converts whatever a rejected query/mutation threw into an `EditorError`. */
export function toEditorError(cause: unknown): EditorError {
  if (cause instanceof EditorFailure) return cause.error;
  if (cause instanceof DOMException && cause.name === "AbortError") return networkError("timeout", "The request was aborted");
  if (cause instanceof TypeError) return networkError("offline", "The backend could not be reached");
  return networkError("http", cause instanceof Error ? cause.message : "Unknown error", { retryable: false });
}

/** For wrapping a mutation's `mutateAsync` (or any promise) back into the Result world. */
export const fromPromise = <T>(promise: Promise<T>): ResultAsync<T, EditorError> => ResultAsync.fromPromise(promise, toEditorError);

/** Validates an untrusted backend payload against a schema. */
export function parseResponse<S extends z.ZodType>(schema: S, payload: unknown, what: string): Result<z.output<S>, EditorError> {
  const parsed = schema.safeParse(payload);
  if (parsed.success) return okResult(parsed.data);
  return errResult(
    validationError(
      "invalid_schema",
      `Backend returned an invalid ${what}`,
      parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    ),
  );
}

