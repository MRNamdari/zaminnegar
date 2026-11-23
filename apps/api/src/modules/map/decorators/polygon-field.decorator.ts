import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { MapPolygon } from '../dto/map-polygon';
import { IsPolygon } from '../validators/is-polygon.validator';

/**
 * A single GeoJSON Polygon. This is exactly the geometry the map returns, so what a client reads from
 * `GET /map/features` can be sent back unchanged.
 */
export const PolygonField = (options: { optional?: boolean } = {}) =>
  applyDecorators(ApiProperty({ type: MapPolygon, required: !options.optional }), IsPolygon());
