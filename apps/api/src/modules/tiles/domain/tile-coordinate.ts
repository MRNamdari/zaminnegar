export class InvalidTileCoordinateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidTileCoordinateError";
  }
}
export class TileCoordinate {
  private constructor(
    readonly z: number,
    readonly x: number,
    readonly y: number,
  ) {}
  static create(
    z: number,
    x: number,
    y: number,
    maxZoom: number,
  ): TileCoordinate {
    if (![z, x, y].every(Number.isSafeInteger))
      throw new InvalidTileCoordinateError("Tile coordinates must be integers");
    if (z < 0 || z > maxZoom)
      throw new InvalidTileCoordinateError(
        `Zoom must be between 0 and ${maxZoom}`,
      );
    const limit = 2 ** z;
    if (x < 0 || y < 0 || x >= limit || y >= limit)
      throw new InvalidTileCoordinateError(
        "Tile x/y is outside the zoom-level bounds",
      );
    return new TileCoordinate(z, x, y);
  }
  get key(): string {
    return `${this.z}/${this.x}/${this.y}`;
  }
  get upstreamPath(): string {
    return `${this.z}/${this.x}/${this.y}`;
  }
}
