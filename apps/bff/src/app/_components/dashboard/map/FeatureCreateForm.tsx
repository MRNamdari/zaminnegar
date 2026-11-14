'use client';

import type { FeatureCreateFormProps } from './feature-create-form.types';
import { BlockCreateForm } from './BlockCreateForm';
import { ParcelCreateForm } from './ParcelCreateForm';
import { RegionCreateForm } from './RegionCreateForm';

export function FeatureCreateForm(props: FeatureCreateFormProps) {
  switch (props.draft.level) {
    case 'region':
      return <RegionCreateForm {...props} />;
    case 'block':
      return <BlockCreateForm {...props} />;
    case 'parcel':
      return <ParcelCreateForm {...props} />;
  }
}
