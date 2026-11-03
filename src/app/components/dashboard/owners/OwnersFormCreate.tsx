"use client";

import { useForm } from "@tanstack/react-form";
import { createFormOwner, OwnerFormValues } from "@/app/components/dashboard/owners/schemas/OwnersCreate.schema";
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
  const form = useForm({
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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4 mt-4"
    >
      <div className="flex gap-2">
        <form.Field name="name">
          {(field) => (
            <div className="w-1/2">
              <label className="block text-sm mb-2">نام و نام‌خانوادگی</label>

              <input
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none"
              />

              {field.state.meta.errors.map((error, index) => (
                <p key={index} className="text-action-error text-sm mt-1">
                  {typeof error === "string" ? error : error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field name="fatherName">
          {(field) => (
            <div className="w-1/2">
              <label className="block text-sm mb-2">نام پدر</label>

              <input
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none"
              />
              {field.state.meta.errors.map((error, index) => (
                <p key={index} className="text-action-error text-sm mt-1">
                  {typeof error === "string" ? error : error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>
      </div>

      <div className="flex gap-2">
        <form.Field name="nationalCode">
          {(field) => (
            <div className="w-1/2">
              <label className="block text-sm mb-2">کد ملی</label>

              <input
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none"
              />
              {field.state.meta.errors.map((error, index) => (
                <p key={index} className="text-action-error text-sm mt-1">
                  {typeof error === "string" ? error : error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field name="phoneNumber">
          {(field) => (
            <div className="w-1/2">
              <label className="block text-sm mb-2">شماره تماس</label>

              <input
                type="tel"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none text-right"
              />
              {field.state.meta.errors.map((error, index) => (
                <p key={index} className="text-action-error text-sm mt-1">
                  {typeof error === "string" ? error : error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>
      </div>

      <div className="flex gap-2">
        <form.Field name="totalArea">
          {(field) => (
            <div className="w-1/2">
              <label className="block text-sm mb-2">مساحت کل</label>

              <input
                disabled
                type="text"
                value={field.state.value}
                className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none"
              />
              {field.state.meta.errors.map((error, index) => (
                <p key={index} className="text-action-error text-sm mt-1">
                  {typeof error === "string" ? error : error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field name="parcelCount">
          {(field) => (
            <div className="w-1/2">
              <label className="block text-sm mb-2">تعداد قطعات</label>

              <input
                disabled
                type="text"
                value={field.state.value}
                className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none"
              />
              {field.state.meta.errors.map((error, index) => (
                <p key={index} className="text-action-error text-sm mt-1">
                  {typeof error === "string" ? error : error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="status">
        {(field) => (
          <div>
            <label className="block text-sm mb-2">وضعیت مالک</label>

            <div className="relative">
              <select
                value={field.state.value}
                onChange={(e) =>
                  field.handleChange(e.target.value as "فعال" | "غیر فعال")
                }
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
                <p key={index} className="text-action-error text-sm mt-1">
                  {String(error)}
                </p>
              ))}
            </div>
          </div>
        )}
      </form.Field>

      <form.Field name="address">
        {(field) => (
          <div>
            <label className="block text-sm mb-2">آدرس</label>

            <textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none resize-none"
              rows={3}
            />
            {field.state.meta.errors.map((error, index) => (
              <p key={index} className="text-action-error text-sm mt-1">
                {typeof error === "string" ? error : error?.message}
              </p>
            ))}
          </div>
        )}
      </form.Field>

      <div className="flex gap-3 mt-2">
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

        <button
          type="submit"
          className="w-1/2 py-2.5 rounded-lg bg-action-primary hover:bg-action-primary-hover transition duration-300 cursor-pointer"
        >
          افزودن مالک
        </button>
      </div>
    </form>
  );
}
