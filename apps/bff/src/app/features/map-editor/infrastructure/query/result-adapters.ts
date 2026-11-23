import { err as errResult, ok as okResult, ResultAsync, type Result } from "neverthrow";
import type { z } from "zod";
import { issuesFromZod, validationError, type EditorError } from "../../core/errors";
import { translateApiError } from "../api/error-translation";

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

/**
 * Converts whatever a rejected query/mutation threw into an `EditorError`. An `EditorFailure` already carries one;
 * anything else (an API status error, a validation failure, a network failure) goes through the same status and
 * backend-code translation the gateway uses, so a failed query reads like a failed save.
 */
export function toEditorError(cause: unknown): EditorError {
  if (cause instanceof EditorFailure) return cause.error;
  return translateApiError(cause, { operation: "read" }).error;
}

/** For wrapping a mutation's `mutateAsync` (or any promise) back into the Result world. */
export const fromPromise = <T>(promise: Promise<T>): ResultAsync<T, EditorError> => ResultAsync.fromPromise(promise, toEditorError);

/** Validates an untrusted backend payload against a schema. */
export function parseResponse<S extends z.ZodType>(schema: S, payload: unknown): Result<z.output<S>, EditorError> {
  const parsed = schema.safeParse(payload);
  if (parsed.success) return okResult(parsed.data);
  return errResult(validationError("invalid_schema", { subject: "backend_response", issues: issuesFromZod(parsed.error) }));
}

