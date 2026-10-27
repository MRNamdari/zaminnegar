/** Serializable description of a failed server action. */
export interface ActionError {
  code: string;
  message: string;
  details?: unknown;
}

/** What every server action returns: expected failures are data, not exceptions. */
export type ActionResult<TData> = { ok: true; data: TData } | { ok: false; error: ActionError };
