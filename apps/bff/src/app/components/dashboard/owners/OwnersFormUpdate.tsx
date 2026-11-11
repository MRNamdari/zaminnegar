'use client';

import { useState } from 'react';
import { useAppForm } from '@/app/components/form/hooks/form';
import { Owner } from '@/app/components/dashboard/owners/OwnersTable';
import {
  updateFormOwner,
  UpdateOwnerFormValues,
} from '@/app/components/dashboard/owners/schemas/OwnersUpdate.schema';
import { FiTrash2 } from 'react-icons/fi';

interface Props {
  editedOwner: Owner;
  onSubmit: (owner: Owner) => void;
  onCancel: () => void;
}

type SelectedParcel = {
  parcelId: string;
  share: number;
};

type ParcelOption = {
  id: string;
  name: string;
  areaM2: number;
};

// فعلاً Mock Data؛ بعداً از API دریافت کن.
const availableParcels: ParcelOption[] = [
  { id: '1', name: 'P-1001', areaM2: 1000 },
  { id: '2', name: 'P-1002', areaM2: 2000 },
  { id: '3', name: 'P-1003', areaM2: 1500 },
];

export default function OwnersFormUpdate({
  editedOwner,
  onSubmit,
  onCancel,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [personalInfoError, setPersonalInfoError] = useState(false);

  const [selectedParcels, setSelectedParcels] = useState<SelectedParcel[]>(
    editedOwner.parcelShares?.map((item) => ({
      parcelId: item.parcelId,
      share: item.share,
    })) ?? [],
  );

  const initialValues: UpdateOwnerFormValues = {
    name: editedOwner.name,
    fatherName: editedOwner.fatherName,
    nationalCode: editedOwner.nationalCode,
    phoneNumber: editedOwner.phoneNumber,
    totalArea: editedOwner.totalArea,
    parcelCount: editedOwner.parcelCount,
    status: editedOwner.status,
    address: editedOwner.address,
    parcelShares:
      editedOwner.parcelShares?.map((item) => ({
        parcelId: item.parcelId,
        share: item.share,
      })) ?? [],
  };

  const form = useAppForm({
    defaultValues: initialValues,

    validators: {
      onSubmit: updateFormOwner,
      onBlur: updateFormOwner
    },

    onSubmit: async ({ value }) => {
      const updatedOwner: Owner = {
        ...editedOwner,
        ...value,
        parcelShares: value.parcelShares,
      };

      onSubmit(updatedOwner);
    },
  });

  // بررسی خالی نبودن اطلاعات شخصی
  const hasMissingPersonalInfo = () => {
    const values = {
      name: form.getFieldValue('name'),
      fatherName: form.getFieldValue('fatherName'),
      nationalCode: form.getFieldValue('nationalCode'),
      phoneNumber: form.getFieldValue('phoneNumber'),
      address: form.getFieldValue('address'),
    };

    return Object.values(values).some((value) => !value || !value.trim());
  };

  // رفتن به مرحله دوم
  const goToNextStep = () => {
    setPersonalInfoError(hasMissingPersonalInfo());
    setStep(2);
  };

  // بازگشت به مرحله اول
  const goToPreviousStep = () => {
    setPersonalInfoError(false);
    setStep(1);
  };

  // محاسبه مجموع مساحت سهم مالک
  const calculateTotalArea = (parcels: SelectedParcel[]) => {
    return parcels.reduce((total, item) => {
      const parcel = availableParcels.find((p) => p.id === item.parcelId);

      if (!parcel) return total;

      return total + parcel.areaM2 * (item.share / 100);
    }, 0);
  };

  // بروزرسانی قطعات انتخاب شده و مقادیر محاسباتی فرم
  const updateParcels = (parcels: SelectedParcel[]) => {
    setSelectedParcels(parcels);

    form.setFieldValue('parcelShares', parcels);
    form.setFieldValue('parcelCount', parcels.length);
    form.setFieldValue('totalArea', calculateTotalArea(parcels));
  };

  // افزودن قطعه
  const addParcel = () => {
    updateParcels([...selectedParcels, { parcelId: '', share: 0 }]);
  };

  // حذف قطعه
  const removeParcel = (index: number) => {
    updateParcels(selectedParcels.filter((_, i) => i !== index));
  };

  // تغییر اطلاعات قطعه
  const updateParcel = (index: number, changes: Partial<SelectedParcel>) => {
    const updated = selectedParcels.map((item, i) =>
      i === index ? { ...item, ...changes } : item,
    );

    updateParcels(updated);
  };

  const totalArea = calculateTotalArea(selectedParcels);

  // ثبت نهایی فرم
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const hasMissingInfo = hasMissingPersonalInfo();

    setPersonalInfoError(hasMissingInfo);

    if (hasMissingInfo) return;

    const hasInvalidParcel = selectedParcels.some(
      (item) =>
        !item.parcelId ||
        !Number.isFinite(item.share) ||
        item.share <= 0 ||
        item.share > 100,
    );

    if (hasInvalidParcel) return;

    form.setFieldValue('parcelShares', selectedParcels);
    form.setFieldValue('parcelCount', selectedParcels.length);
    form.setFieldValue('totalArea', totalArea);

    void form.handleSubmit();
  };

  // انصراف و بازگرداندن فرم به مقادیر اولیه
  const handleCancel = () => {
    form.reset();

    setSelectedParcels(
      editedOwner.parcelShares?.map((item) => ({
        parcelId: item.parcelId,
        share: item.share,
      })) ?? [],
    );

    setPersonalInfoError(false);
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
        {/* مرحله اول: اطلاعات شخصی مالک */}
        {step === 1 && (
          <>
            <div className="flex gap-2 justify-between">
              <form.AppField name="name">
                {(field) => (
                  <field.TextField
                    label="نام و نام‌خانوادگی"
                    placeholder="نام و نام‌خانوادگی را وارد کنید"
                    required
                  />
                )}
              </form.AppField>

              <form.AppField name="fatherName">
                {(field) => (
                  <field.TextField
                    label="نام پدر"
                    placeholder="نام پدر را وارد کنید"
                    required
                  />
                )}
              </form.AppField>
            </div>

            <div className="flex gap-2 justify-between">
              <form.AppField name="nationalCode">
                {(field) => (
                  <field.TextField
                    label="کد ملی"
                    placeholder="کد ملی را وارد کنید"
                    required
                  />
                )}
              </form.AppField>

              <form.AppField name="phoneNumber">
                {(field) => (
                  <field.TextField
                    label="شماره تماس"
                    placeholder="شماره تماس را وارد کنید"
                    required
                  />
                )}
              </form.AppField>
            </div>

            <form.AppField name="status">
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

            <form.AppField name="address">
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
            {personalInfoError && (
              <p className="text-sm text-red-500">
                لطفاً ابتدا تمام اطلاعات شخصی مالک را تکمیل کنید.
              </p>
            )}

            <div className="flex gap-2 justify-between">
              <form.AppField name="totalArea">
                {(field) => (
                  <field.TextField
                    label="مساحت کل سهم مالک (متر مربع)"
                    disabled
                  />
                )}
              </form.AppField>

              <form.AppField name="parcelCount">
                {(field) => <field.TextField label="تعداد قطعات" disabled />}
              </form.AppField>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">قطعات تحت مالکیت</h3>

                  <p className="text-xs text-muted-foreground mt-1">
                    قطعات و درصد سهم مالک را مشخص کنید.
                  </p>
                </div>

                <span className="text-xs text-muted-foreground">
                  {selectedParcels.length} قطعه
                </span>
              </div>

              {selectedParcels.map((item, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-border p-3 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      قطعه {index + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeParcel(index)}
                      title="حذف قطعه"
                      aria-label={`حذف قطعه ${index + 1}`}
                      className="text-action-error hover:opacity-70 transition cursor-pointer"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2 min-w-0">
                      <label className="text-sm">انتخاب قطعه</label>

                      <select
                        value={item.parcelId}
                        onChange={(e) =>
                          updateParcel(index, {
                            parcelId: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-border bg-background p-2.5 text-sm outline-none"
                      >
                        <option value="">انتخاب قطعه</option>

                        {availableParcels
                          .filter(
                            (parcel) =>
                              !selectedParcels.some(
                                (selected, i) =>
                                  selected.parcelId === parcel.id &&
                                  i !== index,
                              ),
                          )
                          .map((parcel) => (
                            <option key={parcel.id} value={parcel.id}>
                              {parcel.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-2 min-w-0">
                      <label className="text-sm">درصد سهم مالک</label>

                      <input
                        type="number"
                        min={0.01}
                        max={100}
                        step="0.01"
                        value={item.share || ''}
                        onChange={(e) =>
                          updateParcel(index, {
                            share:
                              e.target.value === ''
                                ? 0
                                : Number(e.target.value),
                          })
                        }
                        placeholder="مثلاً ۵۰"
                        className="w-full rounded-lg border border-border bg-background p-2.5 text-sm outline-none"
                      />
                    </div>
                  </div>

                  {item.parcelId && (
                    <p className="text-xs text-muted-foreground">
                      مساحت سهم:{' '}
                      {(
                        (availableParcels.find((p) => p.id === item.parcelId)
                          ?.areaM2 || 0) *
                        (item.share / 100)
                      ).toLocaleString('fa-IR')}{' '}
                      متر مربع
                    </p>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addParcel}
                className="w-full border border-dashed border-border rounded-lg py-3 text-sm hover:bg-muted/50 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>+</span>
                افزودن قطعه
              </button>
            </div>
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
