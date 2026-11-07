"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogProps } from "../../Dialog";
import { useAppForm } from "../../form/hooks/form";
import { AddRegionSchema } from "./schema/addRegionSchema";

export function AddRegionDialog(props: Omit<DialogProps, "children">) {
  const router = useRouter();

  const form = useAppForm({
    defaultValues: {
      name: "",
      description: "",
    },

    validators: {
      onSubmit: AddRegionSchema,
    },

    onSubmit: async ({ value }) => {
      console.log("Region Data:", value);

      router.push("/map");
    },
  });

  return (
    <Dialog {...props}>
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
              onBlur: AddRegionSchema.shape.name,
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
              onBlur: AddRegionSchema.shape.description,
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
              onClick={() => props.onOpenChange?.(false)}
              className="w-1/2 py-2.5 rounded-lg bg-action-error hover:bg-action-error-hover transition duration-300 cursor-pointer"
            >
              انصراف
            </button>

            <form.SubmitButton disabled={true} label="برو به نقشه" />
          </div>
        </form>
      </form.AppForm>
    </Dialog>
  );
}
