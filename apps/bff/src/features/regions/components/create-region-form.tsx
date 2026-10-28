'use client';

import type { RegionDto } from '@zaminnegar/api-client';
import { Button } from '@/components/ui/button';
import { useAppForm } from '@/lib/form/use-app-form';
import { fa } from '@/messages/fa';
import { useCreateRegion } from '../hooks/use-create-region';
import { createRegionSchema, type CreateRegionInput } from '../schemas/create-region.schema';

interface CreateRegionFormProps {
  onCreated: (region: RegionDto) => void;
  onCancel: () => void;
}

const DEFAULT_VALUES: CreateRegionInput = {
  name: '',
  description: '',
  territory: JSON.stringify(
    {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [35.0, 32.0],
            [35.1, 32.0],
            [35.1, 32.1],
            [35.0, 32.1],
            [35.0, 32.0],
          ],
        ],
      ],
    },
    null,
    2,
  ),
};

export function CreateRegionForm({ onCreated, onCancel }: CreateRegionFormProps) {
  const createRegion = useCreateRegion();
  const form = useAppForm({
    defaultValues: DEFAULT_VALUES,
    validators: { onChange: createRegionSchema },
    onSubmit: async ({ value }) => {
      await createRegion.mutateAsync(createRegionSchema.parse(value)).then(onCreated, () => undefined);
    },
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.AppField name="name">{(field) => <field.TextField label={fa.regions.nameLabel} autoFocus />}</form.AppField>
      <form.AppField name="description">{(field) => <field.TextareaField label={fa.regions.descriptionLabel} rows={3} />}</form.AppField>
      <form.AppField name="territory">{(field) => <field.TextareaField label={fa.regions.territoryLabel} rows={8} />}</form.AppField>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          {fa.common.cancel}
        </Button>
        <form.AppForm>
          <form.SubmitButton>{fa.common.create}</form.SubmitButton>
        </form.AppForm>
      </div>
    </form>
  );
}
