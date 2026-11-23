export class TileNotFoundError extends Error {
  constructor() {
    super("Tile not found");
    this.name = "TileNotFoundError";
  }
}
export type ProviderFailure =
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "UNAVAILABLE"
  | "INVALID_RESPONSE"
  | "CIRCUIT_OPEN";
export class TileProviderError extends Error {
  constructor(
    readonly failure: ProviderFailure,
    message: string,
    readonly retryable = false,
  ) {
    super(message);
    this.name = "TileProviderError";
  }
}
export class TileStorageError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "TileStorageError";
  }
}
export class TileLockError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "TileLockError";
  }
}
