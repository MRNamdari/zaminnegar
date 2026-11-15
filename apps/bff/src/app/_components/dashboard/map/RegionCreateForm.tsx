'use client';

import { CreateRegionDto } from '@zaminnegar/api-client';
import type { z } from 'zod';
import { useAppForm } from '../../form/hooks/form';
import type { FeatureCreateFormProps } from './feature-create-form.types';

export function RegionCreateForm({
  draft,
  values,
  onSubmit,
  onCancel,
  isSubmitting,
  errorMessage,
}: FeatureCreateFormProps) {
  const description =
    'description' in values ? (values.description ?? '') : '';

  const defaultValues: z.input<typeof CreateRegionDto> = {
    name: '',
    description,
    status: values.status ?? 'active',
  };
  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: CreateRegionDto,
    },
    onSubmit: async ({ value, formApi }) => {
      onSubmit({
        name: value.name,
        description: value.description ?? '',
        status: value.status,
      });
      formApi.reset()
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
          validators={{ onBlur: CreateRegionDto.shape.name }}
        >
          {(field) => (
            <field.TextField
              label="کد منطقه"
              placeholder="کد منطقه را وارد کنید"
              required
            />
          )}
        </form.AppField>

        <form.AppField
          name="description"
          validators={{ onBlur: CreateRegionDto.shape.description }}
        >
          {(field) => (
            <field.TextareaField
              label="توضیحات منطقه"
              placeholder="توضیحات منطقه را وارد کنید"
            />
          )}
        </form.AppField>

        <form.AppField
          name="status"
          validators={{ onBlur: CreateRegionDto.shape.status }}
        >
          {(field) => (
            <field.SelectField
              label="وضعیت منطقه"
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
                label="ثبت منطقه"
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
