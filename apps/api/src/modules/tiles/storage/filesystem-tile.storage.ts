import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import lockfile = require('proper-lockfile');
import tilesConfig from '../config';
import { TileCoordinate } from '../domain/tile-coordinate';
import { getTileImageContentType } from '../domain/tile-image';
import { StoredTile, TileStorage } from '../domain/tile.types';
import { TileLockError } from '../errors/tile-lock.error';
import { TileStorageError } from '../errors/tile-storage.error';

@Injectable()
export class FilesystemTileStorage implements TileStorage, OnModuleInit {
  private readonly logger = new Logger(FilesystemTileStorage.name);
  constructor(
    @Inject(tilesConfig.KEY)
    private readonly config: ConfigType<typeof tilesConfig>,
  ) {}
  async onModuleInit(): Promise<void> {
    try {
      await fs.mkdir(this.config.cacheDir, { recursive: true });
      await fs.mkdir(path.join(this.config.cacheDir, '.locks'), {
        recursive: true,
      });
    } catch (error) {
      throw new TileStorageError("Unable to create cache directory", {
        cause: error,
      });
    }
  }
  private file(coordinate: TileCoordinate): string {
    return path.join(
      this.config.cacheDir,
      'v2',
      String(coordinate.z),
      String(coordinate.x),
      `${coordinate.y}.png`,
    );
  }
  private negativeFile(coordinate: TileCoordinate): string {
    return `${this.file(coordinate)}.404`;
  }
  private lockTarget(coordinate: TileCoordinate): string {
    return path.join(
      this.config.cacheDir,
      '.locks',
      `${createHash('sha256').update(coordinate.key).digest('hex')}.lock-target`,
    );
  }

  async get(coordinate: TileCoordinate): Promise<StoredTile | null> {
    const file = this.file(coordinate);
    try {
      const [buffer, stat] = await Promise.all([
        fs.readFile(file),
        fs.stat(file),
      ]);
      if (Date.now() - stat.mtimeMs > this.config.ttlSeconds * 1000) {
        await fs.unlink(file).catch(() => undefined);
        return null;
      }
      if (!getTileImageContentType(buffer)) {
        this.logger.warn(`Removing invalid cached tile ${coordinate.key}`);
        await fs.unlink(file).catch(() => undefined);
        return null;
      }
      const now = new Date();
      await fs.utimes(file, now, stat.mtime);
      return {
        buffer,
        modifiedAt: stat.mtime,
        etag: `"${createHash('sha256').update(buffer).digest('hex')}"`,
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw new TileStorageError(`Unable to read tile ${coordinate.key}`, {
        cause: error,
      });
    }
  }

  async put(coordinate: TileCoordinate, buffer: Buffer): Promise<void> {
    if (
      !getTileImageContentType(buffer) ||
      buffer.length > this.config.maxTileBytes
    )
      throw new TileStorageError('Tile failed image or size validation');
    const target = this.file(coordinate);
    const directory = path.dirname(target);
    const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
    try {
      await fs.mkdir(directory, { recursive: true });
      await fs.writeFile(temporary, buffer, { flag: 'wx', mode: 0o640 });
      await fs.rename(temporary, target);
      await fs.unlink(this.negativeFile(coordinate)).catch(() => undefined);
    } catch (error) {
      await fs.unlink(temporary).catch(() => undefined);
      throw new TileStorageError(`Unable to persist tile ${coordinate.key}`, {
        cause: error,
      });
    }
  }

  async isNegative(coordinate: TileCoordinate): Promise<boolean> {
    try {
      const stat = await fs.stat(this.negativeFile(coordinate));
      if (Date.now() - stat.mtimeMs > this.config.negativeTtlSeconds * 1000) {
        await fs.unlink(this.negativeFile(coordinate)).catch(() => undefined);
        return false;
      }
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
      throw new TileStorageError('Unable to inspect negative cache', {
        cause: error,
      });
    }
  }
  async markNegative(coordinate: TileCoordinate): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.file(coordinate)), { recursive: true });
      await fs.writeFile(this.negativeFile(coordinate), '', { mode: 0o640 });
    } catch (error) {
      throw new TileStorageError('Unable to write negative cache marker', {
        cause: error,
      });
    }
  }

  async withLock<T>(
    coordinate: TileCoordinate,
    work: () => Promise<T>,
  ): Promise<T> {
    const target = this.lockTarget(coordinate);
    try {
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, 'lock target', { flag: 'a' });
    } catch (error) {
      throw new TileLockError('Unable to prepare tile lock', { cause: error });
    }
    let release: (() => Promise<void>) | undefined;
    try {
      release = await lockfile.lock(target, {
        stale: this.config.lockStaleMs,
        update: Math.max(1000, Math.floor(this.config.lockStaleMs / 2)),
        retries: {
          retries: 30,
          minTimeout: 100,
          maxTimeout: 500,
          maxRetryTime: this.config.lockWaitMs,
        },
      });
    } catch (error) {
      throw new TileLockError(
        `Timed out waiting for tile lock ${coordinate.key}`,
        { cause: error },
      );
    }
    try {
      return await work();
    } finally {
      await release().catch((error) =>
        this.logger.error(`Failed releasing lock for ${coordinate.key}`, error),
      );
    }
  }
}
