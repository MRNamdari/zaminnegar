'use client';

import { useEffect, useState } from 'react';
import { useSelector } from '@tanstack/react-form';
import { useAppForm } from '@/app/_components/form/hooks/form';
import {
  AssignOwnerDto,
  OwnerResponseDto,
  ParcelResponseDto as Parcel,
} from '@zaminnegar/api-client';
import { faNum } from '@/app/util';
import { FiTrash2 } from 'react-icons/fi';
import z from 'zod';

export type OwnerShareRow = z.input<typeof AssignOwnerDto>;

export const getOwnerValidationError = (
  rows: OwnerShareRow[],
): string | undefined => {
  if (rows.length === 0) {
    return 'حداقل یک مالک باید به قطعه اختصاص داده شود.';
  }

  if (rows.some((row) => !row.ownerId)) {
    return 'لطفاً برای هر ردیف یک مالک انتخاب کنید.';
  }

  if (new Set(rows.map((row) => row.ownerId)).size !== rows.length) {
    return 'هر مالک فقط می‌تواند یک بار در این قطعه انتخاب شود.';
  }

  if (
    rows.some(
      (row) =>
        !Number.isFinite(Number(row.sharePct)) ||
        Number(row.sharePct) <= 0 ||
        Number(row.sharePct) > 100,
    )
  ) {
    return 'درصد سهم مالک باید بیشتر از ۰ و حداکثر ۱۰۰ باشد.';
  }

  const totalShare = rows.reduce(
    (total, row) => total + Number(row.sharePct),
    0,
  );
  if (totalShare > 100 + 1e-9) {
    return 'مجموع سهم مالکین نباید بیشتر از ۱۰۰ درصد باشد.';
  }
  if (Math.round(totalShare * 100) / 100 !== 100) {
    return 'مجموع سهم مالکین باید دقیقاً ۱۰۰ درصد باشد.';
  }

  return undefined;
};

export const parcelOwnersSchema = z
  .object({
    owners: z.array(
      z.object({
        ownerId: AssignOwnerDto.shape.ownerId,
        sharePct: AssignOwnerDto.shape.sharePct,
      }),
    ),
  })
  .superRefine(({ owners }, context) => {
    const error = getOwnerValidationError(owners);
    if (error) {
      context.addIssue({
        code: 'custom',
        message: error,
        path: ['owners'],
      });
    }
  });

export type ParcelOwnersValues = z.output<typeof parcelOwnersSchema>;

interface Props {
  parcel: Parcel;
  owners: OwnerResponseDto[];
  initialValues: ParcelOwnersValues;
  isSaving: boolean;
  onValuesChange: (values: ParcelOwnersValues) => void;
  onBack: (values: ParcelOwnersValues) => void;
  onSave: (values: ParcelOwnersValues) => void;
}

const normalizePct = (value: number) =>
  Math.round((Number(value) || 0) * 100) / 100;

export default function ParcelOwnersStep({
  parcel,
  owners,
  initialValues,
  isSaving,
  onValuesChange,
  onBack,
  onSave,
}: Props) {
  const [ownerError, setOwnerError] = useState('');
  const form = useAppForm({
    defaultValues: initialValues,
    validators: {
      onSubmit: parcelOwnersSchema,
    },
    onSubmit: async ({ value }) => onSave(value),
  });

  const values = useSelector(form.store, (state) => state.values);
  const ownerShares = useSelector(
    form.store,
    (state) => state.values.owners,
  );

  useEffect(() => {
    onValuesChange(values);
  }, [onValuesChange, values]);
  const totalShare = ownerShares.reduce(
    (total, item) => total + (Number(item.sharePct) || 0),
    0,
  );
  const normalizedTotal = normalizePct(totalShare);

  const addOwner = () => {
    form.setFieldValue('owners', (previous) => [
      ...previous,
      { ownerId: '', sharePct: 0 },
    ]);
    setOwnerError('');
  };

  const removeOwnerFromParcel = (index: number) => {
    const remainingOwners = form.state.values.owners.filter(
      (_, itemIndex) => itemIndex !== index,
    );
    form.setFieldValue('owners', remainingOwners);
    onValuesChange({ owners: remainingOwners });
    setOwnerError('');
  };

  const ownerChoices = new Map(owners.map((owner) => [owner.id, owner]));
  for (const ownership of parcel.ownerships ?? []) {
    if (!ownerChoices.has(ownership.ownerId)) {
      ownerChoices.set(ownership.ownerId, ownership.owner);
    }
  }

  return (
    <form.AppForm>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOwnerError(
            getOwnerValidationError(form.state.values.owners) ?? '',
          );
          void form.handleSubmit();
        }}
        className="flex flex-col gap-4 mt-4"
      >
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
            const selectedOwner = ownerChoices.get(item.ownerId);
            const availableOwners = [...ownerChoices.values()]
              .map((owner) => {
                const alreadySelected = ownerShares.some(
                  (share, shareIndex) =>
                    shareIndex !== index && share.ownerId === owner.id,
                );
                const isCurrentOwner = owner.id === item.ownerId;
                const isActive = owner.status === 'active';
                const statusLabel =
                  owner.status === 'inactive'
                    ? 'غیرفعال'
                    : owner.status === 'pending'
                      ? 'در انتظار تأیید'
                      : owner.status;

                return {
                  label: isActive
                    ? owner.name
                    : `${owner.name} (${statusLabel})`,
                  value: owner.id,
                  disabled:
                    alreadySelected || (!isActive && !isCurrentOwner),
                };
              });

            return (
              <div
                key={`${item.ownerId || 'new-owner'}-${index}`}
                className="rounded-xl border border-white/10 p-3 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    مالک {index + 1}
                  </span>
                  {ownerShares.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOwnerFromParcel(index)}
                      title="حذف مالک"
                      aria-label={`حذف مالک ${index + 1}`}
                      className="text-action-error hover:opacity-70 transition cursor-pointer"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 items-end text-foreground">
                  <form.AppField
                    name={`owners[${index}].ownerId` as const}
                    validators={{
                      onSubmit: AssignOwnerDto.shape.ownerId,
                    }}
                  >
                    {(field) => (
                      <field.SelectField
                        label="انتخاب مالک"
                        placeholder="انتخاب مالک"
                        options={availableOwners}
                        required
                      />
                    )}
                  </form.AppField>

                  <form.AppField
                    name={`owners[${index}].sharePct` as const}
                    validators={{
                      onSubmit: AssignOwnerDto.shape.sharePct,
                    }}
                  >
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
                    کد ملی: {selectedOwner.nationalId}
                  </p>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={addOwner}
            className="w-full border border-dashed border-border rounded-lg py-3 text-sm text-foreground hover:opacity-80 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>+</span>
            افزودن مالک دیگر
          </button>
        </div>

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

        {ownerError && (
          <p className="text-sm text-red-400">{ownerError}</p>
        )}

        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            onClick={() => onBack(form.state.values)}
            className="w-1/2 py-2.5 rounded-lg bg-action-error hover:bg-action-error-hover transition duration-300 cursor-pointer"
          >
            مرحله قبل
          </button>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <button
                type="submit"
                disabled={isSaving || isSubmitting}
                className="w-1/2 py-2.5 rounded-lg bg-action-primary hover:bg-action-primary-hover transition duration-300 cursor-pointer disabled:bg-action-primary/50 disabled:cursor-not-allowed"
              >
                {isSaving || isSubmitting
                  ? 'در حال ذخیره...'
                  : 'ذخیره تغییرات'}
              </button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </form.AppForm>
  );
}
