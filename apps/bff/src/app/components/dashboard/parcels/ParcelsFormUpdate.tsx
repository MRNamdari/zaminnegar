
'use client';

import { useState } from 'react';
import { useSelector } from '@tanstack/react-form';
import { useAppForm } from '../../form/hooks/form';

import {
  updateFormParcel,
  UpdateParcelFormValues,
} from './schema/ParcelsUpdate.schema';

import { Parcel } from './ParcelsTable';
import { Owner } from '../owners/OwnersTable';
import { faNum } from '@/app/util';
import { FiTrash2 } from 'react-icons/fi';

interface Props {
  parcel: Parcel;
  owners: Owner[];
  onSubmit: (values: UpdateParcelFormValues) => void;
  onCancel: () => void;
}

const getInitialValues = (
  parcel: Parcel,
): UpdateParcelFormValues => ({
  nameParcel: parcel.name,
  parcelStatus: parcel.status,
  owners:
    parcel.owners?.map((item) => ({
      ownerId: item.ownerId,
      share: item.share,
    })) ?? [{ ownerId: '', share: 0 }],
});

export default function ParcelsFormUpdate({
  onSubmit,
  onCancel,
  parcel,
  owners,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [ownerError, setOwnerError] = useState('');

  const form = useAppForm({
    defaultValues: getInitialValues(parcel),

    validators: {
      onSubmit: updateFormParcel,
    },

    onSubmit: async ({ value }) => {
      const totalShare = value.owners.reduce(
        (total, item) => total + Number(item.share),
        0,
      );

      const normalizedTotal = Math.round(totalShare * 100) / 100;

      if (normalizedTotal !== 100) {
        setOwnerError('مجموع سهم مالکین باید دقیقاً ۱۰۰ درصد باشد.');
        return;
      }

      setOwnerError('');

      const payload: UpdateParcelFormValues = {
        nameParcel: value.nameParcel,
        parcelStatus: value.parcelStatus,
        owners: value.owners.map((item) => ({
          ownerId: item.ownerId,
          share: Number(item.share),
        })),
      };

      onSubmit(payload);
    },
  });

  // دریافت مستقیم مقادیر مالکین از TanStack Form
  const ownerShares = useSelector(
    form.store,
    (state) => state.values.owners,
  );

  // محاسبه مجموع سهم مالکین
  const totalShare = ownerShares.reduce(
    (total, item) => total + (Number(item.share) || 0),
    0,
  );

  const normalizedTotal = Math.round(totalShare * 100) / 100;

  // افزودن مالک جدید
  const addOwner = () => {
    form.setFieldValue('owners', (previous) => [
      ...previous,
      { ownerId: '', share: 0 },
    ]);

    setOwnerError('');
  };

  // حذف مالک
  const removeOwner = (index: number) => {
    form.setFieldValue('owners', (previous) =>
      previous.filter((_, i) => i !== index),
    );

    setOwnerError('');
  };

  // رفتن به مرحله دوم
  const goToNextStep = async () => {
    const errors = await form.validateField('nameParcel', 'submit');

    if (errors.length > 0) return;

    setStep(2);
  };

  // بازگشت به مرحله اول
  const goToPreviousStep = () => {
    setOwnerError('');
    setStep(1);
  };

  // ثبت فرم
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    void form.handleSubmit();
  };

  // انصراف و بازنشانی فرم
  const handleCancel = () => {
    form.reset();
    setOwnerError('');
    setStep(1);
    onCancel();
  };

  return (
    <form.AppForm>
      <form
        noValidate
        onSubmit={handleFormSubmit}
        className="flex flex-col gap-4 mt-4"
      >
        {/* مرحله اول: مشخصات قطعه */}
        {step === 1 && (
          <>
            <div>
              <h3 className="text-base font-semibold mb-1">
                مشخصات قطعه
              </h3>

              <p className="text-sm text-gray-400">
                اطلاعات قطعه را ویرایش کنید.
              </p>
            </div>

            <form.AppField
              name="nameParcel"
              validators={{
                onBlur: updateFormParcel.shape.nameParcel,
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
          </>
        )}

        {/* مرحله دوم: اطلاعات مالکین */}
        {step === 2 && (
          <>
            <div>
              <h3 className="mt-1 text-base font-medium leading-6 text-foreground-secondary">
                اطلاعات مالکین قطعه
              </h3>

              <p className="text-sm text-foreground">
                مالکین قطعه و درصد سهم هرکدام را مشخص کنید.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {ownerShares.map((item, index) => {
                const selectedOwner = owners.find(
                  (owner) => owner.id === item.ownerId,
                );

                const availableOwners = owners
                  .filter((owner) => {
                    const alreadySelected = ownerShares.some(
                      (share, i) => i !== index && share.ownerId === owner.id,
                    );

                    return (
                      owner.id === item.ownerId ||
                      (owner.status === 'فعال' && !alreadySelected)
                    );
                  })
                  .map((owner) => ({
                    label:
                      owner.status === 'فعال'
                        ? owner.name
                        : `${owner.name} (غیرفعال)`,
                    value: owner.id,
                  }));

                return (
                  <div
                    key={index}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-3 flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        مالک {index + 1}
                      </span>

                      {ownerShares.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOwner(index)}
                          title="حذف مالک"
                          aria-label={`حذف مالک ${index + 1}`}
                          className="text-action-error hover:opacity-70 transition cursor-pointer"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 items-end text-foreground">
                      {/* انتخاب مالک */}
                      <form.AppField name={`owners[${index}].ownerId` as any}>
                        {(field) => (
                          <field.SelectField
                            label="انتخاب مالک"
                            placeholder="انتخاب مالک"
                            options={availableOwners}
                            required
                          />
                        )}
                      </form.AppField>

                      {/* درصد سهم */}
                      <form.AppField name={`owners[${index}].share` as any}>
                        {(field) => (
                          <field.NumberField
                            label="درصد سهم مالک"
                            placeholder="مثلاً ۵۰"
                            min={0}
                            max={100}
                            step={0.01}
                            required
                          />
                        )}
                      </form.AppField>
                    </div>

                    {selectedOwner && (
                      <p className="text-xs text-foreground-muted">
                        کد ملی: {selectedOwner.nationalCode}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* افزودن مالک */}
              <button
                type="button"
                onClick={addOwner}
                className="w-full border border-dashed border-border rounded-lg py-3 text-sm text-foreground hover:opacity-80 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>+</span>
                افزودن مالک دیگر
              </button>
            </div>

            {/* مجموع سهم مالکین */}
            <div className="rounded-lg bg-white/5 border border-white/10 p-3 flex items-center justify-between">
              <span className="text-sm text-foreground-hover">
                مجموع سهم مالکین
              </span>

              <span
                className={`font-semibold ${
                  normalizedTotal === 100
                    ? 'text-green-400'
                    : normalizedTotal > 100
                      ? 'text-red-400'
                      : 'text-yellow-400'
                }`}
              >
                {faNum(totalShare)}٪ از ۱۰۰٪
              </span>
            </div>

            {ownerError && normalizedTotal !== 100 && (
              <p className="text-sm text-red-400">{ownerError}</p>
            )}
          </>
        )}

        {/* دکمه‌ها */}
        <div className="flex items-center gap-3 mt-2">
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="w-1/2 py-2.5 rounded-lg bg-action-error hover:bg-action-error-hover transition duration-300 cursor-pointer"
              >
                انصراف
              </button>

              <button
                type="button"
                onClick={goToNextStep}
                className="w-1/2 py-2.5 rounded-lg bg-action-primary hover:bg-action-primary-hover transition duration-300 cursor-pointer"
              >
                مرحله بعد
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={goToPreviousStep}
                className="w-1/2 py-2.5 rounded-lg bg-action-error hover:bg-action-error-hover transition duration-300 cursor-pointer"
              >
                مرحله قبل
              </button>

              <form.SubmitButton label="ذخیره تغییرات" />
            </>
          )}
        </div>
      </form>
    </form.AppForm>
  );
}
