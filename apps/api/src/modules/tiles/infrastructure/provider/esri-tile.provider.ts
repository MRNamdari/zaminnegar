import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { IncomingHttpHeaders } from 'node:http';
import { firstValueFrom } from 'rxjs';
import tilesConfig from '../../config';
import { TileCoordinate } from '../../domain/tile-coordinate';
import { getTileImageContentType } from '../../domain/tile-image';
import { TileProviderError } from '../../domain/tile.errors';
import { TileProvider } from '../../domain/tile.types';

const excludedHeaders = new Set([
  'authorization',
  'connection',
  'content-length',
  'cookie',
  'cookie2',
  'expect',
  'host',
  'if-match',
  'if-modified-since',
  'if-none-match',
  'if-range',
  'if-unmodified-since',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'range',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'accept-encoding',
  'forwarded',
  'x-api-key',
  'x-auth-token',
  'x-forwarded-for',
  'x-forwarded-host',
  'x-forwarded-port',
  'x-forwarded-proto',
  'x-real-ip',
]);
const sensitiveHeaderName =
  /(?:^|[-_])(?:api[-_]?key|auth|authorization|credential|password|secret|token)(?:$|[-_])/i;

function getForwardedHeaders(
  requestHeaders: IncomingHttpHeaders = {},
): Record<string, string> {
  const connectionHeaders = new Set(
    (requestHeaders.connection ?? '')
      .split(',')
      .map((header) => header.trim().toLowerCase())
      .filter(Boolean),
  );
  const forwardedHeaders: Record<string, string> = {};

  for (const [name, value] of Object.entries(requestHeaders)) {
    const normalizedName = name.toLowerCase();
    if (
      value === undefined ||
      excludedHeaders.has(normalizedName) ||
      sensitiveHeaderName.test(normalizedName) ||
      connectionHeaders.has(normalizedName)
    ) {
      continue;
    }
    forwardedHeaders[normalizedName] = Array.isArray(value)
      ? value.join(', ')
      : value;
  }

  return forwardedHeaders;
}

@Injectable()
export class EsriTileProvider implements TileProvider {
  private readonly logger = new Logger(EsriTileProvider.name);
  private failures = 0;
  private circuitOpenedAt = 0;
  constructor(
    private readonly http: HttpService,
    @Inject(tilesConfig.KEY)
    private readonly config: ConfigType<typeof tilesConfig>,
  ) {}

  async fetch(
    coordinate: TileCoordinate,
    requestHeaders: IncomingHttpHeaders = {},
  ): Promise<Buffer> {
    if (this.failures >= this.config.circuitThreshold) {
      if (Date.now() - this.circuitOpenedAt < this.config.circuitResetMs)
        throw new TileProviderError(
          'CIRCUIT_OPEN',
          'Upstream circuit breaker is open',
          true,
        );
      this.failures = 0;
    }
    let lastError: unknown;
    for (let attempt = 0; attempt <= this.config.upstreamRetries; attempt++) {
      try {
        const url = `${this.config.upstreamUrl}/${coordinate.upstreamPath}`;
        const response = await firstValueFrom(
          this.http.get<ArrayBuffer>(url, {
            responseType: 'arraybuffer',
            timeout: this.config.upstreamTimeoutMs,
            validateStatus: () => true,
            headers: getForwardedHeaders(requestHeaders),
          }),
        );
        if (response.status === 404)
          throw new TileProviderError('NOT_FOUND', 'Tile does not exist');
        if (response.status === 429)
          throw new TileProviderError(
            'RATE_LIMITED',
            'Upstream rate limited the request',
            true,
          );
        if (response.status < 200 || response.status >= 300)
          throw new TileProviderError(
            'UNAVAILABLE',
            `Upstream returned HTTP ${response.status}`,
            response.status >= 500,
          );
        const contentType = String(
          response.headers['content-type'] ?? '',
        ).toLowerCase();
        const buffer = Buffer.from(response.data);
        const imageContentType = getTileImageContentType(buffer);
        if (!imageContentType || contentType !== imageContentType)
          throw new TileProviderError(
            'INVALID_RESPONSE',
            'Upstream response was not a valid 256x256 PNG or JPEG',
          );
        this.failures = 0;
        return buffer;
      } catch (error) {
        lastError = error;
        if (error instanceof TileProviderError && !error.retryable) {
          if (error.failure === 'NOT_FOUND') throw error;
          if (error.failure === 'INVALID_RESPONSE') throw error;
        }
        if (attempt < this.config.upstreamRetries)
          await new Promise((resolve) =>
            setTimeout(
              resolve,
              Math.min(2000, 200 * 2 ** attempt) +
                Math.floor(Math.random() * 150),
            ),
          );
      }
    }
    this.failures += 1;
    if (this.failures >= this.config.circuitThreshold)
      this.circuitOpenedAt = Date.now();
    this.logger.error('Esri tile request failed after retries');
    if (lastError instanceof TileProviderError) throw lastError;
    throw new TileProviderError(
      'TIMEOUT',
      'Unable to retrieve tile from upstream',
      true,
    );
  }
}
