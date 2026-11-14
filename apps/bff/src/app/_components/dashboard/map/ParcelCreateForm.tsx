'use client';

import type {
  DraftConfigurationStepProps,
  Level,
} from '@/app/features/map-editor';
import { CreateParcelDto } from '@zaminnegar/api-client';
import { useAppForm } from '../../form/hooks/form';

CreateParcelDto.shape.geometry;

export function ParcelCreateForm({
  draft,
  values,
  onSubmit,
}: DraftConfigurationStepProps<CreateParcelDto>) {
  const [parentType, parentId] = (draft.parentId?.split(':') as [
    Level,
    string,
  ]) ?? ['block', ''];
  console.log({ parentId, parentType });
  const form = useAppForm({
    defaultValues: {
      projectId: '6d758969-a52c-48fc-bca3-2b79676aa366',
      name: draft.name,
      geometry: {
        type: 'MultiPolygon' as const,
        coordinates: [draft.geometry.coordinates],
      },
    } as CreateParcelDto,
    validators: {
      onSubmit: CreateParcelDto,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      onSubmit(value);
    },
    onSubmitInvalid: console.log,
  });
  return (
    <form.AppForm>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.AppField
          name="name"
          validators={{
            onBlur: CreateParcelDto.shape.name,
          }}
        >
          {(field) => (
            <field.TextField
              label="کد قطعه"
              placeholder="کد قطعه را وارد کنید"
              required
            />
          )}
        </form.AppField>

        <label className="block text-sm my-3">وضعیت قطعه</label>

        <div className="w-full rounded-lg border border-border bg-white/5 px-3 py-3 text-sm text-gray-400 cursor-not-allowed">
          در انتظار تکمیل
        </div>

        <p className="text-xs text-gray-500 my-2">
          وضعیت قطعه پس از ثبت و طی مراحل بررسی تغییر می‌کند.
        </p>
        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
            isSubmitted: state.isSubmitted,
            errors: state.errors,
            values: state.values,
          })}
        >
          {(state) => (
            <>
              <form.SubmitButton
                label="ثبت قطعه"
                disabled={!state.canSubmit || state.isSubmitting}
              />
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(state, null, 2)}
              </pre>
            </>
          )}
        </form.Subscribe>
      </form>
    </form.AppForm>
  );
}
