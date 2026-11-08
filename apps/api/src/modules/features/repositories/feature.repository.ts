import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/database/base.repository';
import { FeatureEntity } from '../entities/feature.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { IFeature } from '../interfaces/feature.interface';

@Injectable()
export class FeatureRepository extends BaseRepository<FeatureEntity> {
  constructor(
    @InjectRepository(FeatureEntity) repository: Repository<FeatureEntity>,
  ) {
    super(repository);
  }
  async findByIdAndProjectId(
    id: string,
    projectId: string,
    manager?: EntityManager,
  ): Promise<IFeature | null> {
    return this.getRepository(manager).findOneBy({ id, projectId });
  }

  async findByProjectIdAndRegionId(
    projectId: string,
    regionId: string,
    manager?: EntityManager,
  ): Promise<IFeature[]> {
    return this.getRepository(manager).findBy({
      projectId,
      region: { id: regionId },
    });
  }

  async findByProjectIdAndBlockId(
    projectId: string,
    blockId: string,
    manager?: EntityManager,
  ): Promise<IFeature[]> {
    return this.getRepository(manager).findBy({
      projectId,
      block: { id: blockId },
    });
  }

  async findByProjectIdAndParcelId(
    projectId: string,
    parcelId: string,
    manager?: EntityManager,
  ): Promise<IFeature[]> {
    return this.getRepository(manager).findBy({
      projectId,
      parcel: { id: parcelId },
    });
  }
}
