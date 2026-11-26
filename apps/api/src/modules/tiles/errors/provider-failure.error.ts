export type ProviderFailure =
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'UNAVAILABLE'
  | 'INVALID_RESPONSE'
  | 'CIRCUIT_OPEN';
export class TileProviderError extends Error {
  constructor(
    readonly failure: ProviderFailure,
    message: string,
    readonly retryable = false,
  ) {
    super(message);
    this.name = 'TileProviderError';
  }
}
