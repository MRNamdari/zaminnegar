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
        <form.AppField name="blockAreaName">
          {(field) => (
            <field.SelectField
              label="نام منطقه"
              options={[
                { label: "مرکز", value: "مرکز" },
                { label: "شمال", value: "شمال" },
                { label: "جنوب", value: "جنوب" },
                { label: "شرق", value: "شرق" },
                { label: "غرب", value: "غرب" },
              ]}
            />
          )}
        </form.AppField>
        <form.AppField name="blockStatus">
          {(field) => (
            <field.SelectField
              label="وضعیت بلوک"
              options={[
                { label: "نهایی", value: "نهایی" },
                { label: "پیش‌نویس", value: "پیش‌نویس" },
                { label: "پیشنهادیه", value: "پیشنهادیه" },
              ]}
            />
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
