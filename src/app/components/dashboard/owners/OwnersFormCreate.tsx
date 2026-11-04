"use client";

import { useAppForm } from "@/app/components/form/hooks/form";
import {
  createFormOwner,
  OwnerFormValues,
} from "@/app/components/dashboard/owners/schemas/OwnersCreate.schema";
import { IoChevronDown } from "react-icons/io5";

interface Props {
  onSubmit: (values: OwnerFormValues) => void;
  onCancel: () => void;
}

const initialValues: OwnerFormValues = {
  name: "",
  fatherName: "",
  nationalCode: "",
  phoneNumber: "",
  totalArea: 0,
  parcelCount: 0,
  status: "فعال",
  address: "",
};

export default function CreateOwnerForm({ onSubmit, onCancel }: Props) {
  const form = useAppForm({
    defaultValues: initialValues,

    validators: {
      onSubmit: createFormOwner,
    },

    onSubmit: async ({ value }) => {
      console.log("Form Submitted:", value);
      onSubmit(value);
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
        {/* نام و نام پدر */}
        <div className="flex gap-2">
          <form.AppField
            name="name"
            validators={{
              onBlur: createFormOwner.shape.name,
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
              onBlur: createFormOwner.shape.fatherName,
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

        {/* کد ملی و شماره تماس */}
        <div className="flex gap-2">
          <form.AppField
            name="nationalCode"
            validators={{
              onBlur: createFormOwner.shape.nationalCode,
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
              onBlur: createFormOwner.shape.phoneNumber,
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

        {/* مساحت کل و تعداد قطعات */}
        <div className="flex gap-2">
          <form.AppField name="totalArea">
            {(field) => (
              <field.TextField
                label="مساحت کل"
                disabled
              />
            )}
          </form.AppField>

          <form.AppField name="parcelCount">
            {(field) => (
              <field.TextField
                label="تعداد قطعات"
                disabled
              />
            )}
          </form.AppField>
        </div>

        {/* وضعیت مالک */}
        <form.AppField
          name="status"
          validators={{
            onBlur: createFormOwner.shape.status,
          }}
        >
          {(field) => (
            <div>
              <label className="block text-sm mb-2">
                وضعیت مالک
              </label>

              <div className="relative">
                <select
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value as "فعال" | "غیر فعال"
                    )
                  }
                  onBlur={field.handleBlur}
                  className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none appearance-none"
                >
                  <option value="فعال">فعال</option>
                  <option value="غیر فعال">غیر فعال</option>
                </select>

                <IoChevronDown
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  size={18}
                />

                {field.state.meta.errors.map((error, index) => (
                  <p
                    key={index}
                    className="text-action-error text-sm mt-1"
                  >
                    {typeof error === "string"
                      ? error
                      : error?.message}
                  </p>
                ))}
              </div>
            </div>
          )}
        </form.AppField>

        {/* آدرس */}
        <form.AppField
          name="address"
          validators={{
            onBlur: createFormOwner.shape.address,
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

        {/* دکمه‌ها */}
        <div className="flex items-center gap-3 mt-2">
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

          <form.SubmitButton label="افزودن مالک" />
        </div>
      </form>
    </form.AppForm>
  );
} 