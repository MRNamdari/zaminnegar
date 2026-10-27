'use client';

import type { ParcelDto } from '@zaminnegar/api-client';
import { useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useAppForm } from '@/lib/form/use-app-form';
import { formatNumber } from '@/lib/utils/format';
import { fa } from '@/messages/fa';
import { useParcelPreview, useUpdateParcel } from '../hooks/use-update-parcel';
import { toFormValues, toPatch } from '../lib/parcel-properties-mapper';
import { parcelPropertiesSchema, STROKE_WIDTH_RANGE, type ParcelPropertiesInput } from '../schemas/parcel-properties.schema';

/** Delay between the last edit and the request that persists it. */
const AUTOSAVE_DELAY_MS = 700;

interface ParcelPropertiesFormProps {
  projectId: string;
  parcel: ParcelDto;
}

/**
 * Autosaving editor for a parcel's name, colors, opacity, outline width and notes.
 * Every valid change is shown on the map immediately (cache preview) and saved after a short pause.
 * Mount it with `key={parcel.id}` so the form starts fresh for each parcel.
 */
export function ParcelPropertiesForm({ projectId, parcel }: ParcelPropertiesFormProps) {
  const preview = useParcelPreview(projectId);
  const updateParcel = useUpdateParcel(projectId);

  const save = useDebouncedCallback((values: ParcelPropertiesInput) => {
    updateParcel.mutate({ parcelId: parcel.id, patch: toPatch(values) });
  }, AUTOSAVE_DELAY_MS);
  // Never lose a pending edit when the user selects another parcel.
  useEffect(() => () => save.flush(), [save]);

  const form = useAppForm({
    defaultValues: toFormValues(parcel),
    validators: { onChange: parcelPropertiesSchema },
    listeners: {
      onChange: ({ formApi }) => {
        const parsed = parcelPropertiesSchema.safeParse(formApi.state.values);
        if (!parsed.success) return;
        preview(parcel.id, toPatch(parsed.data));
        save(parsed.data);
      },
    },
  });

  return (
    <form className="grid gap-4" onSubmit={(event) => event.preventDefault()}>
      <form.AppField name="name">{(field) => <field.TextField label={fa.properties.name} maxLength={120} />}</form.AppField>
      <div className="grid grid-cols-2 gap-3">
        <form.AppField name="fillColor">{(field) => <field.ColorField label={fa.properties.fillColor} />}</form.AppField>
        <form.AppField name="strokeColor">{(field) => <field.ColorField label={fa.properties.strokeColor} />}</form.AppField>
      </div>
      <form.AppField name="fillOpacity">
        {(field) => <field.SliderField label={fa.properties.fillOpacity} min={0} max={1} step={0.05} formatValue={(v) => `${formatNumber(Math.round(v * 100))}٪`} />}
      </form.AppField>
      <form.AppField name="strokeWidth">
        {(field) => <field.SliderField label={fa.properties.strokeWidth} min={STROKE_WIDTH_RANGE.min} max={STROKE_WIDTH_RANGE.max} step={0.5} formatValue={formatNumber} />}
      </form.AppField>
      <form.AppField name="notes">{(field) => <field.TextareaField label={fa.properties.notes} rows={3} maxLength={5000} />}</form.AppField>
    </form>
  );
}
