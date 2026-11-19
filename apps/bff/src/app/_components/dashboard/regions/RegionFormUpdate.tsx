"use client";

import { RegionResponseDto, UpdateRegionDto } from "@zaminnegar/api-client";
import { useAppForm } from "../../form/hooks/form";
import z from "zod";

interface Props {
  region: RegionResponseDto;
  onSubmit: (value: z.input<typeof UpdateRegionDto>) => void;
  onCancel: () => void;
}

export default function RegionFormUpdate({ onSubmit, onCancel, region}: Props) {
  
  const defaultValues: z.input<typeof UpdateRegionDto> = {
    name: region.name,
    description: region.description ?? "",
  };

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: UpdateRegionDto,
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
          name="name"
          validators={{
            onBlur: UpdateRegionDto.shape.name,
          }}
        >
          {(field) => (
            <field.TextField
              label="نام منطقه"
              placeholder="نام منطقه را وارد کنید"
              required
            />
          )}
        </form.AppField>

        <form.AppField
          name="description"
          validators={{
            onBlur: UpdateRegionDto.shape.description,
          }}
        >
          {(field) => (
            <field.TextareaField
              label="توضیحات"
              placeholder="توضیحات منطقه را وارد کنید"
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
            className="w-full py-2.5 rounded-lg bg-action-error hover:bg-action-error-hover transition duration-300 cursor-pointer"
          >
            انصراف
          </button>

          <form.SubmitButton label="ثبت تغییرات" />
        </div>
      </form>
    </form.AppForm>
  );
}