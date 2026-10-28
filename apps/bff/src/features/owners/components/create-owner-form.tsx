'use client';

import type { OwnerDto } from '@zaminnegar/api-client';
import { Button } from '@/components/ui/button';
import { useAppForm } from '@/lib/form/use-app-form';
import { fa } from '@/messages/fa';
import { useCreateOwner } from '../hooks/use-create-owner';
import { createOwnerSchema, type CreateOwnerInput } from '../schemas/create-owner.schema';

interface CreateOwnerFormProps {
  onCreated: (owner: OwnerDto) => void;
  onCancel: () => void;
}

const DEFAULT_VALUES: CreateOwnerInput = { name: '', phone: '', email: '', notes: '' };

export function CreateOwnerForm({ onCreated, onCancel }: CreateOwnerFormProps) {
  const createOwner = useCreateOwner();
  const form = useAppForm({
    defaultValues: DEFAULT_VALUES,
    validators: { onChange: createOwnerSchema },
    onSubmit: async ({ value }) => {
      await createOwner.mutateAsync(createOwnerSchema.parse(value)).then(onCreated, () => undefined);
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
      <form.AppField name="name">{(field) => <field.TextField label={fa.owners.nameLabel} autoFocus />}</form.AppField>
      <form.AppField name="phone">{(field) => <field.TextField label={fa.owners.phoneLabel} inputMode="tel" />}</form.AppField>
      <form.AppField name="email">{(field) => <field.TextField label={fa.owners.emailLabel} inputMode="email" />}</form.AppField>
      <form.AppField name="notes">{(field) => <field.TextareaField label={fa.owners.notesLabel} rows={3} />}</form.AppField>
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
