import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { applyProjectScope } from '../../../common/utils/project-scope';
import { Block } from '../../block/entities/block.entity';
import { Parcel } from '../../parcel/entities/parcel.entity';
import { Region } from '../../region/entities/region.entity';
import type { MapFeatureRow } from '../map-feature-row';

@Injectable()
export class MapRepository {
  constructor(
    @InjectRepository(Region) private readonly regions: Repository<Region>,
    @InjectRepository(Block) private readonly blocks: Repository<Block>,
    @InjectRepository(Parcel) private readonly parcels: Repository<Parcel>,
  ) {}

  async findFeatures(
    projectId: string,
    projectScope: string[] | null,
  ): Promise<{ regions: Region[]; blocks: Block[]; parcels: Parcel[] }> {
    const regions = this.regions
      .createQueryBuilder('region')
      .innerJoinAndSelect('region.boundary', 'boundary')
      .where('region.projectId = :projectId', { projectId });
    applyProjectScope(regions, 'region.projectId', projectScope);

    const blocks = this.blocks
      .createQueryBuilder('block')
      .innerJoinAndSelect('block.boundary', 'boundary')
      .where('block.projectId = :projectId', { projectId });
    applyProjectScope(blocks, 'block.projectId', projectScope);

    const parcels = this.parcels
      .createQueryBuilder('parcel')
      .innerJoinAndSelect('parcel.boundary', 'boundary')
      .where('parcel.projectId = :projectId', { projectId });
    applyProjectScope(parcels, 'parcel.projectId', projectScope);

    const [regionRows, blockRows, parcelRows] = await Promise.all([
      regions
        .orderBy('region.name', 'ASC')
        .addOrderBy('region.id', 'ASC')
        .getMany(),
      blocks
        .orderBy('block.name', 'ASC')
        .addOrderBy('block.id', 'ASC')
        .getMany(),
      parcels
        .orderBy('parcel.name', 'ASC')
        .addOrderBy('parcel.id', 'ASC')
        .getMany(),
    ]);

    return { regions: regionRows, blocks: blockRows, parcels: parcelRows };
  }

  /** Which level an id belongs to, and the project that owns it; `null` when no region, block or parcel has it. */
  async locate(id: string): Promise<{ level: MapFeatureRow['level']; projectId: string } | null> {
    const select = { id: true, projectId: true } as const;
    const [region, block, parcel] = await Promise.all([
      this.regions.findOne({ where: { id }, select }),
      this.blocks.findOne({ where: { id }, select }),
      this.parcels.findOne({ where: { id }, select }),
    ]);
    if (region) return { level: 'region', projectId: region.projectId };
    if (block) return { level: 'block', projectId: block.projectId };
    if (parcel) return { level: 'parcel', projectId: parcel.projectId };
    return null;
  }

  /** One feature with its boundary, read after a write so the response carries what the database derived. */
  async findFeature(level: MapFeatureRow['level'], id: string): Promise<MapFeatureRow | null> {
    switch (level) {
      case 'region': {
        const entity = await this.regions
          .createQueryBuilder('region')
          .innerJoinAndSelect('region.boundary', 'boundary')
          .where('region.id = :id', { id })
          .getOne();
        return entity ? { level, entity } : null;
      }
      case 'block': {
        const entity = await this.blocks
          .createQueryBuilder('block')
          .innerJoinAndSelect('block.boundary', 'boundary')
          .where('block.id = :id', { id })
          .getOne();
        return entity ? { level, entity } : null;
      }
      case 'parcel': {
        const entity = await this.parcels
          .createQueryBuilder('parcel')
          .innerJoinAndSelect('parcel.boundary', 'boundary')
          .where('parcel.id = :id', { id })
          .getOne();
        return entity ? { level, entity } : null;
      }
    }
  }
}
