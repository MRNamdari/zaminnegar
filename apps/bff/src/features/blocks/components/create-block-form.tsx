'use client';

import type { BlockDto } from '@zaminnegar/api-client';
import { Button } from '@/components/ui/button';
import { useAppForm } from '@/lib/form/use-app-form';
import { fa } from '@/messages/fa';
import { useCreateBlock } from '../hooks/use-create-block';
import { createBlockSchema, type CreateBlockInput } from '../schemas/create-block.schema';

interface CreateBlockFormProps {
  regionId: string;
  onCreated: (block: BlockDto) => void;
  onCancel: () => void;
}

const DEFAULT_VALUES: CreateBlockInput = { name: '', description: '' };

export function CreateBlockForm({ regionId, onCreated, onCancel }: CreateBlockFormProps) {
  const createBlock = useCreateBlock(regionId);
  const form = useAppForm({
    defaultValues: DEFAULT_VALUES,
    validators: { onChange: createBlockSchema },
    onSubmit: async ({ value }) => {
      await createBlock.mutateAsync(createBlockSchema.parse(value)).then(onCreated, () => undefined);
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
      <form.AppField name="name">{(field) => <field.TextField label={fa.blocks.nameLabel} autoFocus />}</form.AppField>
      <form.AppField name="description">{(field) => <field.TextareaField label={fa.blocks.descriptionLabel} rows={3} />}</form.AppField>
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
