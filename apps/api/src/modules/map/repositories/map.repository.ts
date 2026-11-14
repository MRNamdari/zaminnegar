import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { applyProjectScope } from '../../../common/utils/project-scope';
import { Block } from '../../block/entities/block.entity';
import { Parcel } from '../../parcel/entities/parcel.entity';
import { Region } from '../../region/entities/region.entity';

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
}
