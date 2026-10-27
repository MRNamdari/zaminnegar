/**
 * Base class of every domain error. The global exception filter converts it
 * into a consistent JSON body, so handlers and repositories never deal with HTTP.
 */
export abstract class AppError extends Error {
  /** HTTP status code the error maps to. */
  abstract readonly statusCode: number;
  /** Stable machine-readable identifier clients can switch on. */
  abstract readonly code: string;

  /**
   * @param message - Human-readable explanation.
   * @param details - Optional structured context (e.g. per-field validation messages).
   * @param cause - Original error, kept for logging.
   */
  protected constructor(
    message: string,
    readonly details?: unknown,
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = new.target.name;
  }
}
