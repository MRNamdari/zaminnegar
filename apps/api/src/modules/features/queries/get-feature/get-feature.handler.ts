import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetFeatureQuery } from './get-feature.query';
import { FeatureRepository } from '../../repositories/feature.repository';
import { IRegion } from '../../../regions/interfaces/region.interface';
import { IFeature } from '../../interfaces/feature.interface';
import { FeatureNotFoundError } from '../../errors/feature-not-found.error';

@QueryHandler(GetFeatureQuery)
export class GetFeatureHandler implements IQueryHandler<GetFeatureQuery> {
  constructor(private readonly respository: FeatureRepository) {}

  async execute({
    projectId,
    featureId,
    regionId,
    blockId,
    parceId,
  }: GetFeatureQuery): Promise<IFeature[]> {
    const result: IFeature[] = [];
    if (projectId && featureId) {
      const feature = await this.respository.findByIdAndProjectId(
        featureId,
        projectId,
      );
      if (feature) result.push(feature);
      else {
        throw new FeatureNotFoundError();
      }
    }
    if (projectId && regionId) {
        const features = await this.respository.findByProjectIdAndRegionId(
            projectId,
            regionId,
        );
        return features;
    }
    if (projectId && blockId) {
        const features = await this.respository.findByProjectIdAndBlockId(
            projectId,
            blockId,
        );
        return features;
    }
    if (projectId && parceId) {
        const features = await this.respository.findByProjectIdAndParcelId(
            projectId,
            parceId,
        );

        return features
    }
    return result;
  }
}
