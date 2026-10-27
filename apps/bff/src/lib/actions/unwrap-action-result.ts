import type { ActionError, ActionResult } from './action-result';

/** Thrown on the client when a server action reports a failure; TanStack Query treats it as an error. */
export class ActionFailedError extends Error {
  constructor(readonly error: ActionError) {
    super(error.message);
    this.name = 'ActionFailedError';
  }
}

/** Returns the data of a successful {@link ActionResult} or throws {@link ActionFailedError}. */
export function unwrapActionResult<TData>(result: ActionResult<TData>): TData {
  if (!result.ok) throw new ActionFailedError(result.error);
  return result.data;
}
