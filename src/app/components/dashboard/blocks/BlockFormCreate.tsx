"use client";

import { IoChevronDown } from "react-icons/io5";
import { BlockFormValue, createFormBlock } from "./schemas/BlockCreate.schema";
import { useAppForm } from "@/app/components/form/hooks/form";
import { useRouter } from "next/navigation";

interface Props {
  onSubmit: (values: BlockFormValue) => void;
  onCancel: () => void;
}

const initialValues: BlockFormValue = {
  blockCode: "",
  blockAreaName: "مرکز",
  blockStatus: "پیش‌نویس",
};

export default function CreateBlockForm({ onSubmit, onCancel }: Props) {
    const router = useRouter();
  const form = useAppForm({
    defaultValues: initialValues,
    validators: {
      onSubmit: createFormBlock,
    },

    onSubmit: async ({ value }) => {
      console.log("Form Submitted:", value);
        router.push('/map')
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
        <form.AppField
          name="blockCode"
          validators={{
            onBlur: createFormBlock.shape.blockCode,
          }}
        >
          {(field) => (
            <field.TextField
              label="کد بلوک"
              placeholder="نام بلوک را وارد کنید"
              required
            />
          )}
        </form.AppField>
        <form.AppField
          name="blockAreaName"
          validators={{
            onBlur: createFormBlock.shape.blockAreaName,
          }}
        >
          {(field) => (
            <div>
              <label className="block text-sm mb-2">نام منطقه</label>

              <div className="relative">
                <select
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value as BlockFormValue["blockAreaName"],
                    )
                  }
                  onBlur={field.handleBlur}
                  className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none appearance-none"
                >
                  <option value="">انتخاب منطقه</option>
                  <option value="شمال">شمال</option>
                  <option value="جنوب">جنوب</option>
                  <option value="شرق">شرق</option>
                  <option value="غرب">غرب</option>
                  <option value="مرکز">مرکز</option>
                </select>

                <IoChevronDown
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  size={18}
                />

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
          name="blockStatus"
          validators={{
            onBlur: createFormBlock.shape.blockStatus,
          }}
        >
          {(field) => (
            <div>
              <label className="block text-sm mb-2">وضعیت بلوک</label>

              <div className="relative">
                <select
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value as "نهایی" | "پیشنهادیه" | "پیش‌نویس",
                    )
                  }
                  onBlur={field.handleBlur}
                  className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none appearance-none"
                >
                  <option value="نهایی">نهایی</option>
                  <option value="پیشنهادیه">پیشنهادیه</option>
                  <option value="پیش‌نویس">پیش‌نویس</option>
                </select>

                <IoChevronDown
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  size={18}
                />

                {field.state.meta.errors.map((error, index) => (
                  <p key={index} className="text-action-error text-sm mt-1">
                    {typeof error === "string" ? error : error?.message}
                  </p>
                ))}
              </div>
            </div>
          )}
        </form.AppField>
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

          <form.SubmitButton label="برو به نقشه" />
        </div>
      </form>
    </form.AppForm>
  );
}
