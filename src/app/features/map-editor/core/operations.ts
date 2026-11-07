import type { ResultAsync } from "neverthrow";
import type { EditorError } from "./errors";
import type { AreaFeature, CreateFeatureRequest, DeleteFeatureRequest, UpdateFeatureRequest } from "./schemas";

/**
 * Application-facing operation contract. The editor knows nothing about HTTP, NestJS
 * or TanStack Query: the application supplies these functions. Each one resolves to
 * the *canonical* result from the backend, never an optimistic guess.
 */
export interface FeatureOperations {
  createFeature(request: CreateFeatureRequest): ResultAsync<AreaFeature, EditorError>;
  updateFeature(request: UpdateFeatureRequest): ResultAsync<AreaFeature, EditorError>;
  deleteFeature(request: DeleteFeatureRequest): ResultAsync<{ id: string }, EditorError>;
}
