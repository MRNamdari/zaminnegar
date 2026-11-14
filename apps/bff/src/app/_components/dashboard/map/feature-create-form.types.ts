import type {
  CreateBlockDto,
  CreateParcelDto,
  CreateRegionDto,
} from '@zaminnegar/api-client';
import type { DraftConfigurationStepProps } from '@/app/features/map-editor';

export type FeatureCreateValues =
  | CreateRegionDto
  | CreateBlockDto
  | CreateParcelDto;

export type FeatureCreateFormProps =
  DraftConfigurationStepProps<FeatureCreateValues>;
