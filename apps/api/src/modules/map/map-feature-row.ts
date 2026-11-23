import { Block } from '../block/entities/block.entity';
import { Parcel } from '../parcel/entities/parcel.entity';
import { Region } from '../region/entities/region.entity';
import { MapFeatureResponseDto } from './dto/map-feature-response.dto';
import { MultipartFeatureError } from './errors/multipart-feature.error';

/** A stored feature of any level, with its boundary loaded. */
export type MapFeatureRow =
  | { level: 'region'; entity: Region }
  | { level: 'block'; entity: Block }
  | { level: 'parcel'; entity: Parcel };

/** The same GeoJSON feature `GET /map/features` lists. */
export function toMapFeatureResponse(row: MapFeatureRow): MapFeatureResponseDto {
  const feature =
    row.level === 'region'
      ? MapFeatureResponseDto.fromRegion(row.entity)
      : row.level === 'block'
        ? MapFeatureResponseDto.fromBlock(row.entity)
        : MapFeatureResponseDto.fromParcel(row.entity);
  if (!feature) throw new MultipartFeatureError(row.entity.id);
  return feature;
}
