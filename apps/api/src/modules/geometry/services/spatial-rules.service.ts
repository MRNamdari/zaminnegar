import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ChildOutsideGeometryError } from '../../../common/errors/child-outside-geometry.error';
import { GeometryOutsideContainerError } from '../../../common/errors/geometry-outside-container.error';
import { GeometryOverlapError } from '../../../common/errors/geometry-overlap.error';
import { InvalidGeometryError } from '../../../common/errors/invalid-geometry.error';
import { FeatureKind } from '../../../common/interfaces/boundary-usage.interface';
import { IMultiPolygon } from '../../../common/interfaces/geometry.interface';
import { GEOMETRY_TOLERANCE_M2 } from '../geometry.constants';
import { NoContainingRegionError } from '../../../common/errors/no-containing-region.error';

/** Siblings are compared inside this scope (a region's neighbours are the project's other regions, ...). */
const SIBLING_SCOPE: Record<FeatureKind, { table: string; scopeColumn: string }> = {
  region: { table: 'regions', scopeColumn: 'project_id' },
  block: { table: 'blocks', scopeColumn: 'region_id' },
  parcel: { table: 'parcels', scopeColumn: 'region_id' },
};

const GEOM_FROM_JSON = `(SELECT ST_SetSRID(ST_GeomFromGeoJSON($1), 4326) AS geom)`;

interface SiblingContext {
  /** Boundary to leave out of the overlap check (the one being updated). */
  excludeBoundaryId?: string;
}

/**
 * PostGIS rules for region, block and parcel outlines: valid geometry, containment
 * (block in region, parcel in region and block) and no overlap between siblings.
 * Every method runs on the caller's EntityManager so it sees the open transaction.
 */
@Injectable()
export class SpatialRulesService {
  async assertValid(geometry: IMultiPolygon, manager: EntityManager): Promise<void> {
    const rows: Array<{ valid: boolean; reason: string }> = await manager.query(
      `SELECT ST_IsValid(g.geom) AS valid, ST_IsValidReason(g.geom) AS reason FROM ${GEOM_FROM_JSON} g`,
      [JSON.stringify(geometry)],
    );
    if (!rows[0]?.valid) throw new InvalidGeometryError(rows[0]?.reason ?? 'unknown reason');
  }

  /**
   * The region that will own a block/parcel with this outline: the region of the project that
   * contains it (same SQL function the database triggers use, so both always agree).
   */
  async resolveRegionId(
    kind: 'block' | 'parcel',
    geometry: IMultiPolygon,
    projectId: string,
    manager: EntityManager,
  ): Promise<string> {
    const rows: Array<{ id: string | null }> = await manager.query(
      `SELECT resolve_containing_region($2::uuid, ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)) AS id`,
      [JSON.stringify(geometry), projectId],
    );
    const id = rows[0]?.id ?? null;
    if (!id) throw new NoContainingRegionError(kind);
    return id;
  }

  /** The block of `regionId` that contains a parcel with this outline, or null. */
  async resolveBlockId(geometry: IMultiPolygon, regionId: string, manager: EntityManager): Promise<string | null> {
    const rows: Array<{ id: string | null }> = await manager.query(
      `SELECT resolve_containing_block($2::uuid, ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)) AS id`,
      [JSON.stringify(geometry), regionId],
    );
    return rows[0]?.id ?? null;
  }

  async assertRegionRules(
    geometry: IMultiPolygon,
    ctx: SiblingContext & { projectId: string },
    manager: EntityManager,
  ): Promise<void> {
    await this.assertValid(geometry, manager);
    await this.assertNoOverlap('region', geometry, ctx.projectId, ctx.excludeBoundaryId, manager);
  }

  async assertBlockRules(
    geometry: IMultiPolygon,
    ctx: SiblingContext & { regionId: string },
    manager: EntityManager,
  ): Promise<void> {
    await this.assertValid(geometry, manager);
    await this.assertWithin('block', 'region', geometry, ctx.regionId, manager);
    await this.assertNoOverlap('block', geometry, ctx.regionId, ctx.excludeBoundaryId, manager);
  }

  async assertParcelRules(
    geometry: IMultiPolygon,
    ctx: SiblingContext & { regionId: string; blockId: string | null },
    manager: EntityManager,
  ): Promise<void> {
    await this.assertValid(geometry, manager);
    await this.assertWithin('parcel', 'region', geometry, ctx.regionId, manager);
    if (ctx.blockId) await this.assertWithin('parcel', 'block', geometry, ctx.blockId, manager);
    await this.assertNoOverlap('parcel', geometry, ctx.regionId, ctx.excludeBoundaryId, manager);
  }

  /** A region's new outline must still cover all of its blocks and parcels. */
  async assertRegionChildrenWithin(regionId: string, geometry: IMultiPolygon, manager: EntityManager): Promise<void> {
    await this.assertChildrenWithin('block', 'blocks', 'region_id', regionId, geometry, manager);
    await this.assertChildrenWithin('parcel', 'parcels', 'region_id', regionId, geometry, manager);
  }

  private async assertWithin(
    kind: 'block' | 'parcel',
    container: 'region' | 'block',
    geometry: IMultiPolygon,
    containerId: string,
    manager: EntityManager,
  ): Promise<void> {
    const table = container === 'region' ? 'regions' : 'blocks';
    const rows: Array<{ outside: number }> = await manager.query(
      `
      SELECT COALESCE(ST_Area(ST_Difference(g.geom, cb.geometry)::geography), 0) AS outside
      FROM ${table} c
      JOIN boundaries cb ON cb.id = c.boundary_id
      CROSS JOIN ${GEOM_FROM_JSON} g
      WHERE c.id = $2
      `,
      [JSON.stringify(geometry), containerId],
    );
    const outside = Number(rows[0]?.outside ?? 0);
    if (outside > GEOMETRY_TOLERANCE_M2) throw new GeometryOutsideContainerError(kind, container, outside);
  }

  private async assertNoOverlap(
    kind: FeatureKind,
    geometry: IMultiPolygon,
    scopeId: string,
    excludeBoundaryId: string | undefined,
    manager: EntityManager,
  ): Promise<void> {
    const { table, scopeColumn } = SIBLING_SCOPE[kind];
    const rows: Array<{ name: string; overlap: number }> = await manager.query(
      `
      SELECT t.name AS name,
             ST_Area(ST_Intersection(g.geom, ob.geometry)::geography) AS overlap
      FROM ${table} t
      JOIN boundaries ob ON ob.id = t.boundary_id
      CROSS JOIN ${GEOM_FROM_JSON} g
      WHERE t.${scopeColumn} = $2
        AND ($3::uuid IS NULL OR ob.id <> $3)
        AND ob.geometry && g.geom
        AND ST_Intersects(ob.geometry, g.geom)
        AND ST_Area(ST_Intersection(g.geom, ob.geometry)::geography) > $4
      ORDER BY overlap DESC
      LIMIT 1
      `,
      [JSON.stringify(geometry), scopeId, excludeBoundaryId ?? null, GEOMETRY_TOLERANCE_M2],
    );
    if (rows[0]) throw new GeometryOverlapError(kind, rows[0].name, Number(rows[0].overlap));
  }

  private async assertChildrenWithin(
    childKind: 'block' | 'parcel',
    table: 'blocks' | 'parcels',
    parentColumn: 'region_id',
    parentId: string,
    geometry: IMultiPolygon,
    manager: EntityManager,
  ): Promise<void> {
    const rows: Array<{ name: string; outside: number }> = await manager.query(
      `
      SELECT t.name AS name,
             ST_Area(ST_Difference(cb.geometry, g.geom)::geography) AS outside
      FROM ${table} t
      JOIN boundaries cb ON cb.id = t.boundary_id
      CROSS JOIN ${GEOM_FROM_JSON} g
      WHERE t.${parentColumn} = $2
        AND ST_Area(ST_Difference(cb.geometry, g.geom)::geography) > $3
      ORDER BY outside DESC
      LIMIT 1
      `,
      [JSON.stringify(geometry), parentId, GEOMETRY_TOLERANCE_M2],
    );
    if (rows[0]) throw new ChildOutsideGeometryError(childKind, rows[0].name, Number(rows[0].outside));
  }
}
