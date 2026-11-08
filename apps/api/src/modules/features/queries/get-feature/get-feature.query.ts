import { Query } from "@nestjs/cqrs";
import { IFeature } from "../../interfaces/feature.interface";

export class GetFeatureQuery extends Query<IFeature[]>{
    constructor (
        public readonly projectId: string,
        public readonly featureId?: string,
        public readonly regionId?: string,
        public readonly parceId?: string,
        public readonly blockId?: string,
    ){
        super()
    }
}