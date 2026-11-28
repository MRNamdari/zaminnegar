import { InvalidTileCoordinateError } from '@/modules/tiles/errors/invalid-tile-coordinate.error';
import { TileProviderError } from '@/modules/tiles/errors/provider-failure.error';
import { TileLockError } from '@/modules/tiles/errors/tile-lock.error';
import { TileNotFoundError } from '@/modules/tiles/errors/tile-not-found.error';
import { TileStorageError } from '@/modules/tiles/errors/tile-storage.error';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch(
  InvalidTileCoordinateError,
  TileNotFoundError,
  TileProviderError,
  TileStorageError,
  TileLockError,
)
export class TileExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(TileExceptionFilter.name);

  /** Created in `main.ts` with `new`, so the host is passed in rather than injected. */
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: Error, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const response: unknown = host.switchToHttp().getResponse();
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
    httpAdapter.reply(
      response,
      {
        statusCode: status,
        code,
        message,
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }
}
