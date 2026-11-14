'use client';

import { CreateParcelDto } from '@zaminnegar/api-client';
import type { z } from 'zod';
import { useAppForm } from '../../form/hooks/form';
import type { FeatureCreateFormProps } from './feature-create-form.types';

export function ParcelCreateForm({
  draft,
  values,
  onSubmit,
  onCancel,
  isSubmitting,
  errorMessage,
}: FeatureCreateFormProps) {
  const defaultValues: z.input<typeof CreateParcelDto> = {
    name: values.name ?? draft.name,
    status: values.status ?? 'active',
  };
  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: CreateParcelDto,
    },
    onSubmit: async ({ value }) => {
      onSubmit({
        name: value.name,
        status: value.status,
      });
    },
  });

  return (
    <form.AppForm>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.AppField
          name="name"
          validators={{ onBlur: CreateParcelDto.shape.name }}
        >
          {(field) => (
            <field.TextField
              label="کد قطعه"
              placeholder="کد قطعه را وارد کنید"
              required
            />
          )}
        </form.AppField>

        <form.AppField
          name="status"
          validators={{ onBlur: CreateParcelDto.shape.status }}
        >
          {(field) => (
            <field.SelectField
              label="وضعیت قطعه"
              required
              options={[
                { label: 'فعال', value: 'active' },
                { label: 'غیرفعال', value: 'inactive' },
              ]}
            />
          )}
        </form.AppField>

        {errorMessage && (
          <p role="alert" className="text-sm text-action-error">
            {errorMessage}
          </p>
        )}

        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
          })}
        >
          {(state) => (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting || state.isSubmitting}
                className="w-full rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-hover disabled:opacity-50"
              >
                انصراف
              </button>
              <form.SubmitButton
                label="ثبت قطعه"
                disabled={
                  !state.canSubmit || state.isSubmitting || isSubmitting
                }
              />
            </div>
          )}
        </form.Subscribe>
      </form>
    </form.AppForm>
  );
}
