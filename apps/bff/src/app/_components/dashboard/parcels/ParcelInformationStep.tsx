'use client';

import { useEffect } from 'react';
import { useSelector } from '@tanstack/react-form';
import { useAppForm } from '@/app/_components/form/hooks/form';
import { UpdateParcelDto } from '@zaminnegar/api-client';
import z from 'zod';

export const parcelInformationSchema = z.object({
  name: UpdateParcelDto.shape.name.unwrap(),
  status: UpdateParcelDto.shape.status.unwrap(),
});

export type ParcelInformationValues = z.output<
  typeof parcelInformationSchema
>;

interface Props {
  initialValues: ParcelInformationValues;
  onValuesChange: (values: ParcelInformationValues) => void;
  onNext: (values: ParcelInformationValues) => void;
  onCancel: () => void;
}

export default function ParcelInformationStep({
  initialValues,
  onValuesChange,
  onNext,
  onCancel,
}: Props) {
  const form = useAppForm({
    defaultValues: initialValues,
    validators: {
      onSubmit: parcelInformationSchema,
    },
    onSubmit: async ({ value }) => onNext(value),
  });
  const values = useSelector(form.store, (state) => state.values);

  useEffect(() => {
    onValuesChange(values);
  }, [onValuesChange, values]);

  return (
    <form.AppForm>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        className="flex flex-col gap-4 mt-4"
      >
        <div>
          <h3 className="text-base font-semibold mb-1">
            مشخصات قطعه
          </h3>
          <p className="text-sm text-gray-400">
            اطلاعات قطعه را ویرایش کنید.
          </p>
        </div>

        <form.AppField
          name="name"
          validators={{
            onBlur: parcelInformationSchema.shape.name,
            onSubmit: parcelInformationSchema.shape.name,
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

        <div>
          <label className="block text-sm mb-2">
            وضعیت قطعه
          </label>
          <div className="w-full rounded-lg border border-border bg-white/5 px-3 py-3 text-sm text-gray-400 cursor-not-allowed">
            در انتظار تکمیل
          </div>
          <p className="text-xs text-gray-500 mt-2">
            وضعیت قطعه پس از ثبت و طی مراحل بررسی تغییر می‌کند.
          </p>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-1/2 py-2.5 rounded-lg bg-action-error hover:bg-action-error-hover transition duration-300 cursor-pointer"
          >
            انصراف
          </button>
          <button
            type="submit"
            className="w-1/2 py-2.5 rounded-lg bg-action-primary hover:bg-action-primary-hover transition duration-300 cursor-pointer"
          >
            مرحله بعد
          </button>
        </div>
      </form>
    </form.AppForm>
  );
}
