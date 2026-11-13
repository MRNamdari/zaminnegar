"use client";

import { IoChevronDown } from "react-icons/io5";
import { useAppForm } from "@/app/components/form/hooks/form";
import { useRouter } from "next/navigation";
import {
  updateFormBlock,
  UpdateBlockFormValues,
} from "./schemas/BlockUpdate.schema";
import { Block } from "./BlocksTable";

interface Props {
  block: Block;
  onSubmit: (values: UpdateBlockFormValues) => void;
  onCancel: () => void;
}

export default function UpdateBlockForm({ onSubmit, onCancel, block }: Props) {
  const router = useRouter();

  const form = useAppForm({
    defaultValues: {
      blockCode: block.code,
      blockAreaName: block.region,
      blockStatus: block.status,
    },
    validators: {
      onSubmit: updateFormBlock,
    },

    onSubmit: async ({ value }) => {
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
        <form.AppField
          name="blockCode"
          validators={{
            onBlur: updateFormBlock.shape.blockCode,
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

          <form.SubmitButton label="ثبت" />

          <button
            type="button"
            onClick={() => router.push("/map")}
            className="w-1/2 py-2.5 rounded-lg bg-action-primary transition duration-300 cursor-pointer"
          >
            برو به نقشه
          </button>
        </div>
      </form>
    </form.AppForm>
  );
}
