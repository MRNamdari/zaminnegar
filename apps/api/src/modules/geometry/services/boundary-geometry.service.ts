import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InvalidBoundarySourceError } from '../../../common/errors/invalid-boundary-source.error';
import { ProjectMismatchError } from '../../../common/errors/project-mismatch.error';
import { BoundarySource } from '../../../common/interfaces/boundary-source.interface';
import { BoundaryUsage } from '../../../common/interfaces/boundary-usage.interface';
import { IMultiPolygon } from '../../../common/interfaces/geometry.interface';
import { BoundaryInUseError } from '../../boundary/errors/boundary-in-use.error';
import { BoundaryNotFoundError } from '../../boundary/errors/boundary-not-found.error';
import { Boundary } from '../../boundary/entities/boundary.entity';
import { BoundaryRepository } from '../../boundary/repositories/boundary.repository';
import { ParcelRepository } from '../../parcel/repositories/parcel.repository';
import { SpatialRulesService } from './spatial-rules.service';

/**
 * The one place that decides how a boundary comes into being and how its outline changes,
 * shared by the boundary module and by the region, block and parcel handlers.
 */
@Injectable()
export class BoundaryGeometryService {
  constructor(
    private readonly boundaries: BoundaryRepository,
    private readonly parcels: ParcelRepository,
    private readonly spatial: SpatialRulesService,
  ) {}

  /**
   * Returns the boundary a new region/block/parcel will own: either the locked draft named by
   * `source.boundaryId`, or a new row created from `source.geometry`. `assertRules` runs on the
   * geometry before anything is written.
   */
  async acquire(
    source: BoundarySource,
    ctx: { projectId: string; name: string },
    assertRules: (geometry: IMultiPolygon) => Promise<void>,
    manager: EntityManager,
  ): Promise<Boundary> {
    if (source.boundaryId && source.geometry) throw new InvalidBoundarySourceError('both');
    if (source.boundaryId) {
      const draft = await this.lockDraft(source.boundaryId, ctx.projectId, manager);
      await assertRules(draft.geometry);
      return draft;
    }
    if (!source.geometry) throw new InvalidBoundarySourceError('none');
    await assertRules(source.geometry);
    return this.boundaries.saveAndReload(
      this.boundaries.build({ projectId: ctx.projectId, name: ctx.name, geometry: source.geometry }),
      manager,
    );
  }

  /** Loads and locks a boundary that must exist, belong to the project and not be owned yet. */
  async lockDraft(boundaryId: string, projectId: string, manager: EntityManager): Promise<Boundary> {
    const boundary = await this.boundaries.findByIdForUpdate(boundaryId, manager);
    if (!boundary) throw new BoundaryNotFoundError(boundaryId);
    if (boundary.projectId !== projectId) throw new ProjectMismatchError('boundary', boundaryId);
    if (await this.boundaries.findUsage(boundaryId, manager)) throw new BoundaryInUseError(boundaryId);
    return boundary;
  }

  /** Locks the boundary by id and replaces its outline (see {@link applyGeometry}). */
  async replaceGeometry(boundaryId: string, geometry: IMultiPolygon, manager: EntityManager): Promise<Boundary> {
    const boundary = await this.boundaries.findByIdForUpdate(boundaryId, manager);
    if (!boundary) throw new BoundaryNotFoundError(boundaryId);
    return this.applyGeometry(boundary, geometry, manager);
  }

  /**
   * Replaces the outline of `boundary`. A draft only has to be valid; a boundary owned by a
   * region/block/parcel must also satisfy that feature's containment and overlap rules, and the
   * affected parcels' area and occupancy metrics are recalculated afterwards.
   */
  async applyGeometry(boundary: Boundary, geometry: IMultiPolygon, manager: EntityManager): Promise<Boundary> {
    const usage = await this.boundaries.findUsage(boundary.id, manager);
    await this.assertRules(boundary.id, geometry, usage, manager);
    boundary.geometry = geometry;
    const saved = await this.boundaries.saveAndReload(boundary, manager);
    if (usage) await this.recalculateMetrics(usage, manager);
    return saved;
  }

  private async assertRules(
    boundaryId: string,
    geometry: IMultiPolygon,
    usage: BoundaryUsage | null,
    manager: EntityManager,
  ): Promise<void> {
    if (!usage) return this.spatial.assertValid(geometry, manager);
    const excludeBoundaryId = boundaryId;
    switch (usage.kind) {
      case 'region':
        await this.spatial.assertRegionRules(geometry, { projectId: usage.projectId, excludeBoundaryId }, manager);
        await this.spatial.assertRegionChildrenWithin(usage.featureId, geometry, manager);
        return;
      case 'block': {
        // The block's region is derived from its outline (trigger trg_blocks_assign_region), so the
        // rules are checked against the region the *new* outline falls into. Parcels that no longer
        // fit in the block are detached, or attached to it, by trg_boundaries_revalidate_references.
        const regionId = await this.spatial.resolveRegionId('block', geometry, usage.projectId, manager);
        await this.spatial.assertBlockRules(geometry, { regionId, excludeBoundaryId }, manager);
        return;
      }
      case 'parcel': {
        const regionId = await this.spatial.resolveRegionId('parcel', geometry, usage.projectId, manager);
        const blockId = await this.spatial.resolveBlockId(geometry, regionId, manager);
        await this.spatial.assertParcelRules(geometry, { regionId, blockId, excludeBoundaryId }, manager);
        return;
      }
    }
  }

  private async recalculateMetrics(usage: BoundaryUsage, manager: EntityManager): Promise<void> {
    const scope =
      usage.kind === 'region'
        ? { regionId: usage.featureId }
        : usage.kind === 'block'
          ? { blockId: usage.featureId }
          : { parcelId: usage.featureId };
    await this.parcels.recalculateMetrics(scope, manager);
  }
}
