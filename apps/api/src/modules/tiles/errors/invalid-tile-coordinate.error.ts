export class InvalidTileCoordinateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidTileCoordinateError';
  }
}
