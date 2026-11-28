import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { GetTileQuery } from './queries/get-tile.query';
import { TileParamsDto } from './dto/tile-params.dto';
import { TileResult } from './queries/get-tile.handler';
import { getTileImageContentType } from './domain/tile-image';
import { Public } from '@/modules/auth/decorators/access.decorators';

@ApiTags('Tiles')
@Controller('tiles')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class TilesController {
  constructor(private readonly queryBus: QueryBus) {}
  @Public()
  @Get(':z/:x/:y')
  @ApiOperation({
    summary: 'Get an Esri World Imagery map tile',
    description:
      'Returns a cached 256x256 PNG or JPEG tile. On a cache miss, request headers are forwarded to Esri except credentials and hop-by-hop headers.',
  })
  @ApiParam({ name: 'z', type: Number, example: 12 })
  @ApiParam({
    name: 'x',
    type: Number,
    example: 1205,
    description: 'Esri tile row (second path coordinate)',
  })
  @ApiParam({
    name: 'y',
    type: Number,
    example: 1539,
    description: 'Esri tile column (third path coordinate)',
  })
  @ApiProduces('image/png', 'image/jpeg')
  @ApiOkResponse({ description: 'PNG or JPEG map tile' })
  @ApiNotFoundResponse({ description: 'Tile does not exist' })
  async getTile(
    @Param() params: TileParamsDto,
    @Req() request: Request,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.queryBus.execute<GetTileQuery, TileResult>(
      new GetTileQuery(params.z, params.x, params.y, request.headers),
    );
    const contentType = getTileImageContentType(result.buffer);
    if (!contentType)
      throw new Error('Cached tile has an unsupported image format');
    const maxAge = 86400;
    res.set({
      'Content-Type': contentType,
      'Content-Length': String(result.buffer.length),
      'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=3600`,
      ETag: result.etag,
      'Last-Modified': result.modifiedAt.toUTCString(),
      'X-Tile-Cache': result.cache,
      'X-Content-Type-Options': 'nosniff',
    });
    if (request.headers['if-none-match'] === result.etag) {
      res.status(304).end();
      return;
    }
    const since = request.headers['if-modified-since'];
    if (
      since &&
      Number.isFinite(Date.parse(since)) &&
      result.modifiedAt.getTime() <= Date.parse(since) + 999
    ) {
      res.status(304).end();
      return;
    }
    res.status(200).send(result.buffer);
  }
}
