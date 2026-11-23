import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { InvalidTileCoordinateError } from '../../modules/tiles/domain/tile-coordinate';
import {
  TileNotFoundError,
  TileProviderError,
  TileStorageError,
  TileLockError,
} from '../../modules/tiles/domain/tile.errors';

@Catch(
  InvalidTileCoordinateError,
  TileNotFoundError,
  TileProviderError,
  TileStorageError,
  TileLockError,
)
export class TileExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(TileExceptionFilter.name);
  catch(exception: Error, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'TILE_INTERNAL_ERROR';
    let message = 'Unable to serve tile';
    if (exception instanceof InvalidTileCoordinateError) {
      status = HttpStatus.BAD_REQUEST;
      code = 'INVALID_TILE_COORDINATE';
      message = exception.message;
    } else if (exception instanceof TileNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      code = 'TILE_NOT_FOUND';
      message = 'Tile not found';
    } else if (exception instanceof TileProviderError) {
      status =
        exception.failure === 'RATE_LIMITED'
          ? HttpStatus.SERVICE_UNAVAILABLE
          : HttpStatus.BAD_GATEWAY;
      code = `UPSTREAM_${exception.failure}`;
      message = 'Tile provider is temporarily unavailable';
    } else if (exception instanceof TileLockError) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      code = 'TILE_LOCK_TIMEOUT';
      message = 'Tile is busy; retry shortly';
    } else if (exception instanceof TileStorageError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 'TILE_STORAGE_ERROR';
    }
    if (status >= 500) this.logger.error(`${code}: ${exception.message}`);
    response.status(status).json({
      statusCode: status,
      code,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
