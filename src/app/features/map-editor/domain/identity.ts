/**
 * Feature identity. Backend ids are opaque strings; drawing-engine ids for geometry
 * that has not been persisted are prefixed so they can never be mistaken for one.
 */
export const DRAFT_ID_PREFIX = "draft:";

export const isDraftId = (id: string): boolean => id.startsWith(DRAFT_ID_PREFIX);

export function createDraftId(randomUuid: () => string = defaultUuid): string {
  return `${DRAFT_ID_PREFIX}${randomUuid()}`;
}

function defaultUuid(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
