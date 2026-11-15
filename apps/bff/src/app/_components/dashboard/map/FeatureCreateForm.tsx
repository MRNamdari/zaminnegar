'use client';

import type { FeatureCreateFormProps } from './feature-create-form.types';
import { BlockCreateForm } from './BlockCreateForm';
import { ParcelCreateForm } from './ParcelCreateForm';
import { RegionCreateForm } from './RegionCreateForm';

export function FeatureCreateForm(props: FeatureCreateFormProps) {
  switch (props.draft.level) {
    case 'region':
      return <RegionCreateForm key='region-create-form'  {...props} />;
    case 'block':
      return <BlockCreateForm  key='block-create-form' {...props} />;
    case 'parcel':
      return <ParcelCreateForm  key='parcel-create-form' {...props} />;
  }
}
