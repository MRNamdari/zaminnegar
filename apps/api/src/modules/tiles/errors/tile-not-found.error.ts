export class TileNotFoundError extends Error {
  constructor() {
    super('Tile not found');
    this.name = 'TileNotFoundError';
  }
}
