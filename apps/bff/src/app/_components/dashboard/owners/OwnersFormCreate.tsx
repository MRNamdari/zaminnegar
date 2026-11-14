'use client';

import { useState } from 'react';
import { useSelector } from '@tanstack/react-form';
import { useAppForm } from '@/app/_components/form/hooks/form';
import {
  createFormOwner,
  OwnerFormValues,
} from '@/app/_components/dashboard/owners/schemas/OwnersCreate.schema';
import { FiTrash2 } from 'react-icons/fi';

interface Props {
  onSubmit: (values: OwnerFormValues) => void;
  onCancel: () => void;
}

type ParcelShare = OwnerFormValues['parcelShares'][number];

type ParcelOption = {
  id: string;
  name: string;
  areaM2: number;
};

const availableParcels: ParcelOption[] = [
  { id: '1', name: 'P-1001', areaM2: 1000 },
  { id: '2', name: 'P-1002', areaM2: 2000 },
  { id: '3', name: 'P-1003', areaM2: 1500 },
];

const initialValues: OwnerFormValues = {
  name: '',
  fatherName: '',
  nationalCode: '',
  phoneNumber: '',
  totalArea: 0,
  parcelCount: 0,
  status: 'فعال',
  address: '',
  parcelShares: [],
};

const personalInfoFields = [
  'name',
  'fatherName',
  'nationalCode',
  'phoneNumber',
  'status',
  'address',
] as const;

export default function CreateOwnerForm({ onSubmit, onCancel }: Props) {
  const [step, setStep] = useState<1 | 2>(1);

  const form = useAppForm({
    defaultValues: initialValues,

    validators: {
      onSubmit: createFormOwner,
    },

    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  // مقادیر قطعات از Store فرم
  const selectedParcels = useSelector(
    form.store,
    (state) => state.values.parcelShares,
  );

  const totalArea = useSelector(form.store, (state) => state.values.totalArea);

  const parcelCount = useSelector(
    form.store,
    (state) => state.values.parcelCount,
  );

  // محاسبه مساحت کل سهم مالک
  const calculateTotalArea = (parcels: ParcelShare[]) => {
    return parcels.reduce((total, item) => {
      const parcel = availableParcels.find((p) => p.id === item.parcelId);

      if (!parcel) return total;

      return total + parcel.areaM2 * (item.share / 100);
    }, 0);
  };

  // به‌روزرسانی قطعات در TanStack Form
  const updateParcels = (parcels: ParcelShare[]) => {
    form.setFieldValue('parcelShares', parcels);
    form.setFieldValue('parcelCount', parcels.length);
    form.setFieldValue('totalArea', calculateTotalArea(parcels));
  };

  // افزودن قطعه
  const addParcel = () => {
    updateParcels([
      ...selectedParcels,
      {
        parcelId: '',
        share: 0,
      },
    ]);
  };

  // حذف قطعه
  const removeParcel = (index: number) => {
    updateParcels(selectedParcels.filter((_, i) => i !== index));
  };

  // تغییر اطلاعات قطعه
  const updateParcel = (index: number, changes: Partial<ParcelShare>) => {
    const updated = selectedParcels.map((item, i) =>
      i === index ? { ...item, ...changes } : item,
    );

    updateParcels(updated);
  };

  // اعتبارسنجی تمام فیلدهای مرحله اول
  const goToNextStep = async () => {
    await Promise.all(
      personalInfoFields.map((field) => form.validateField(field, 'submit')),
    );

    const hasErrors = personalInfoFields.some((field) => {
      const meta = form.getFieldMeta(field);

      return Boolean(meta?.errors.length);
    });

    if (hasErrors) {
      return;
    }

    setStep(2);
  };

  // بازگشت به مرحله اول
  const goToPreviousStep = () => {
    setStep(1);
  };

  // ثبت نهایی فرم
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (step !== 2) return;

    void form.handleSubmit();
  };

  // انصراف و پاک کردن فرم
  const handleCancel = () => {
    form.reset();
    setStep(1);
    onCancel();
  };

  return (
    <form.AppForm>
      <form
        noValidate
        onSubmit={handleFormSubmit}
        className="mt-4 flex flex-col gap-4"
      >
        {/* مرحله اول: اطلاعات شخصی مالک */}
        {step === 1 && (
          <>
            <div className="flex justify-between gap-2">
              <form.AppField
                name="name"
                validators={{
                  onSubmit: createFormOwner.shape.name,
                }}
              >
                {(field) => (
                  <field.TextField
                    label="نام و نام‌خانوادگی"
                    placeholder="نام و نام‌خانوادگی را وارد کنید"
                    required
                  />
                )}
              </form.AppField>

              <form.AppField
                name="fatherName"
                validators={{
                  onSubmit: createFormOwner.shape.fatherName,
                }}
              >
                {(field) => (
                  <field.TextField
                    label="نام پدر"
                    placeholder="نام پدر را وارد کنید"
                    required
                  />
                )}
              </form.AppField>
            </div>

            <div className="flex justify-between gap-2">
              <form.AppField
                name="nationalCode"
                validators={{
                  onSubmit: createFormOwner.shape.nationalCode,
                }}
              >
                {(field) => (
                  <field.TextField
                    label="کد ملی"
                    placeholder="کد ملی را وارد کنید"
                    required
                  />
                )}
              </form.AppField>

              <form.AppField
                name="phoneNumber"
                validators={{
                  onSubmit: createFormOwner.shape.phoneNumber,
                }}
              >
                {(field) => (
                  <field.TextField
                    label="شماره تماس"
                    placeholder="شماره تماس را وارد کنید"
                    required
                  />
                )}
              </form.AppField>
            </div>

            <form.AppField
              name="status"
              validators={{
                onSubmit: createFormOwner.shape.status,
              }}
            >
              {(field) => (
                <field.SelectField
                  label="وضعیت مالک"
                  options={[
                    { label: 'فعال', value: 'فعال' },
                    { label: 'غیر فعال', value: 'غیر فعال' },
                  ]}
                />
              )}
            </form.AppField>

            <form.AppField
              name="address"
              validators={{
                onSubmit: createFormOwner.shape.address,
              }}
            >
              {(field) => (
                <field.TextareaField
                  label="آدرس"
                  placeholder="آدرس مالک را وارد کنید"
                  rows={3}
                />
              )}
            </form.AppField>
          </>
        )}

        {/* مرحله دوم: قطعات تحت مالکیت */}
        {step === 2 && (
          <>
            <div className="grid grid-cols-2 gap-3 items-end">
              <div className="rounded-lg border border-border p-3">
                <p className="mb-1 text-xs text-foreground">
                  مساحت کل سهم مالک
                </p>

                <p className="text-sm font-medium text-foreground">
                  {Number(totalArea).toLocaleString('fa-IR')} متر مربع
                </p>
              </div>

              <div className="rounded-lg border border-border p-3">
                <p className="mb-1 text-xs text-muted-foreground text-foreground">
                  تعداد قطعات
                </p>

                <p className="text-sm font-medium text-foreground">
                  {parcelCount.toLocaleString('fa-IR')} قطعه
                </p>
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    قطعات تحت مالکیت
                  </h3>

                  <p className="mt-1 text-xs text-foreground">
                    قطعات و درصد سهم مالک را مشخص کنید.
                  </p>
                </div>

                <span className="text-xs text-foreground">
                  {selectedParcels.length.toLocaleString('fa-IR')} قطعه
                </span>
              </div>

              {selectedParcels.map((item, index) => {
                const selectedParcel = availableParcels.find(
                  (parcel) => parcel.id === item.parcelId,
                );

                const shareArea = selectedParcel
                  ? selectedParcel.areaM2 * (item.share / 100)
                  : 0;

                const parcelOptions = availableParcels.filter(
                  (parcel) =>
                    !selectedParcels.some(
                      (selected, i) =>
                        selected.parcelId === parcel.id && i !== index,
                    ),
                );

                return (
                  <div
                    key={index}
                    className="flex flex-col gap-3 rounded-xl border border-border p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        قطعه {index + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeParcel(index)}
                        title="حذف قطعه"
                        aria-label={`حذف قطعه ${index + 1}`}
                        className="cursor-pointer text-action-error transition hover:opacity-70"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 items-end text-foreground">
                      <form.AppField
                        name={`parcelShares[${index}].parcelId` as any}
                      >
                        {(field) => (
                          <field.SelectField
                            label="انتخاب قطعه"
                            placeholder="انتخاب قطعه"
                            options={parcelOptions.map((parcel) => ({
                              label: parcel.name,
                              value: parcel.id,
                            }))}
                            required
                          />
                        )}
                      </form.AppField>

                      <form.AppField
                        name={`parcelShares[${index}].share` as any}
                      >
                        {(field) => (
                          <field.NumberField
                            label="درصد سهم مالک"
                            placeholder="مثلاً ۵۰"
                            min={1}
                            max={100}
                            step={0.01}
                            required
                          />
                        )}
                      </form.AppField>
                    </div>

                    {item.parcelId && (
                      <p className="text-xs text-foreground">
                        مساحت سهم: {shareArea.toLocaleString('fa-IR')} متر مربع
                      </p>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={addParcel}
                className="flex w-full text-foreground cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm transition hover:opacity-80"
              >
                <span>+</span>
                افزودن قطعه
              </button>
            </div>
          </>
        )}

        {/* دکمه‌ها */}
        <div className="mt-2 flex items-center gap-3">
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="w-1/2 cursor-pointer rounded-lg bg-action-error py-2.5 transition duration-300 hover:bg-action-error-hover"
              >
                انصراف
              </button>

              <button
                type="button"
                onClick={goToNextStep}
                className="w-1/2 cursor-pointer rounded-lg bg-action-primary py-2.5 transition duration-300 hover:bg-action-primary-hover"
              >
                مرحله بعد
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={goToPreviousStep}
                className="w-1/2 cursor-pointer rounded-lg bg-action-error py-2.5 transition duration-300 hover:bg-action-error-hover"
              >
                مرحله قبل
              </button>

              <form.SubmitButton label="افزودن مالک" />
            </>
          )}
        </div>
      </form>
    </form.AppForm>
  );
}
