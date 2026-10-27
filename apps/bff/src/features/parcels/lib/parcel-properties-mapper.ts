import type { ParcelDto, UpdateParcelDto } from '@zaminnegar/api-client';
import type { ParcelPropertiesInput } from '../schemas/parcel-properties.schema';

/** Parcel → form values (`null` notes become an empty string for the textarea). */
export function toFormValues(parcel: ParcelDto): ParcelPropertiesInput {
  return {
    name: parcel.name,
    fillColor: parcel.fillColor,
    fillOpacity: parcel.fillOpacity,
    strokeColor: parcel.strokeColor,
    strokeWidth: parcel.strokeWidth,
    notes: parcel.notes ?? '',
  };
}

/** Form values → PATCH body (an empty textarea clears the notes). */
export function toPatch(values: ParcelPropertiesInput): UpdateParcelDto {
  return { ...values, notes: values.notes.trim() === '' ? null : values.notes };
}
