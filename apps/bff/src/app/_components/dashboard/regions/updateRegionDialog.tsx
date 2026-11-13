"use client";

import { Dialog, DialogProps } from "../../Dialog";
import { useAppForm } from "../../form/hooks/form";
import {
  updateformRegion,
  UpdateRegionFormValues,
} from "./schema/RegionUpdate.schema";
import { IRegion } from "@/app/features/regions/interface";

interface Props extends Omit<DialogProps, "children"> {
  region: IRegion;
  onSubmit: (values: UpdateRegionFormValues) => void;
}

export function RegionFormUpdate({
  region,
  onSubmit,
  ...dialogProps
}: Props) {
  const form = useAppForm({
    defaultValues: {
      name: region.name,
      description: region.description ?? "",
    },

    validators: {
      onSubmit: updateformRegion,
    },

    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  return (
    <Dialog {...dialogProps}>
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
              onBlur: updateformRegion.shape.name,
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
              onBlur: updateformRegion.shape.description,
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
                dialogProps.onOpenChange?.(false);
              }}
              className="w-1/2 py-2.5 rounded-lg bg-action-error hover:bg-action-error-hover transition duration-300 cursor-pointer"
            >
              انصراف
            </button>

            <form.SubmitButton label="ثبت تغییرات" />
          </div>
        </form>
      </form.AppForm>
    </Dialog>
  );
}