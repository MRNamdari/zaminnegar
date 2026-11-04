"use client";

import { useAppForm } from "@/app/components/form/hooks/form";
import { Owner } from "@/app/components/dashboard/owners/OwnersTable";
import {
  updateFormOwner,
  UpdateOwnerFormValues,
} from "@/app/components/dashboard/owners/schemas/OwnersUpdate.schema";
import { IoChevronDown } from "react-icons/io5";

interface Props {
  editedOwner: Owner;
  onSubmit: (owner: Owner) => void;
  onCancel: () => void;
}

export default function OwnersFormUpdate({
  editedOwner,
  onSubmit,
  onCancel,
}: Props) {
  const form = useAppForm({
    defaultValues: {
      name: editedOwner.name,
      fatherName: editedOwner.fatherName,
      nationalCode: editedOwner.nationalCode,
      phoneNumber: editedOwner.phoneNumber,
      totalArea: editedOwner.totalArea,
      parcelCount: editedOwner.parcelCount,
      status: editedOwner.status,
      address: editedOwner.address,
    } satisfies UpdateOwnerFormValues,

    validators: {
      onSubmit: ({ value }) => {
        console.log("ZOD VALIDATION INPUT:", value);

        const result = updateFormOwner.safeParse(value);

        console.log("ZOD VALIDATION RESULT:", result);

        if (!result.success) {
          console.log("ZOD ERRORS:", result.error.flatten());
        }

        return result.success
          ? undefined
          : result.error.issues.map((issue) => issue.message);
      },
    },

    onSubmit: async ({ value }) => {
      const updatedOwner: Owner = {
        ...editedOwner,
        ...value,
      };

      onSubmit(updatedOwner);
    },
  });

  return (
    <form.AppForm>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="flex flex-col gap-4 mt-4"
      >
        <div className="flex gap-2">
          <form.AppField
            name="name"
            validators={{
              onBlur: updateFormOwner.shape.name,
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
              onBlur: updateFormOwner.shape.fatherName,
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

        <div className="flex gap-2">
          <form.AppField
            name="nationalCode"
            validators={{
              onBlur: updateFormOwner.shape.nationalCode,
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
              onBlur: updateFormOwner.shape.phoneNumber,
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

        <div className="flex gap-2">
          <form.AppField
            name="totalArea"
            validators={{
              onBlur: updateFormOwner.shape.totalArea,
            }}
          >
            {(field) => (
              <field.NumberField
                label="مساحت کل (هکتار)"
                placeholder="مساحت کل را وارد کنید"
              />
            )}
          </form.AppField>

          <form.AppField
            name="parcelCount"
            validators={{
              onBlur: updateFormOwner.shape.parcelCount,
            }}
          >
            {(field) => (
              <field.NumberField
                label="تعداد قطعات"
                placeholder="تعداد قطعات را وارد کنید"
              />
            )}
          </form.AppField>
        </div>

        <form.AppField
          name="status"
          validators={{
            onBlur: updateFormOwner.shape.status,
          }}
        >
          {(field) => (
            <div>
              <label className="block text-sm mb-2">وضعیت مالک</label>

              <div className="relative">
                <select
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(e.target.value as "فعال" | "غیر فعال")
                  }
                  onBlur={field.handleBlur}
                  className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none appearance-none"
                >
                  <option value="فعال">فعال</option>
                  <option value="غیر فعال">غیرفعال</option>
                </select>

                <IoChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-lg pointer-events-none" />

                {field.state.meta.errors.map((error, index) => (
                  <p key={index} className="text-action-error text-sm mt-1">
                    {typeof error === "string" ? error : error?.message}
                  </p>
                ))}
              </div>
            </div>
          )}
        </form.AppField>

        <form.AppField
          name="address"
          validators={{
            onBlur: updateFormOwner.shape.address,
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

        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            onClick={() => {
              form.reset();
              onCancel();
            }}
            className="w-1/2 py-2.5 rounded-lg bg-action-error hover:bg-action-error-hover transition duration-300 cursor-pointer"
          >
            انصراف
          </button>

          <form.SubmitButton label="ذخیره تغییرات" />
        </div>
      </form>
    </form.AppForm>
  );
}
