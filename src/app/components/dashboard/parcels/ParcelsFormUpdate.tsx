"use client";

import { useRouter } from "next/navigation";
import { useAppForm } from "../../form/hooks/form";
import {
  updateFormParcel,
  UpdateParcelFormValues,
} from "./schema/ParcelsUpdate.schema";
import { Parcel } from "./ParcelsTable";

interface Props {
  parcel: Parcel;
  onSubmit: (values: UpdateParcelFormValues) => void;
  onCancel: () => void;
}

export default function ParcelsFormUpdate({
  onSubmit,
  onCancel,
  parcel,
}: Props) {
  const router = useRouter();

  const form = useAppForm({
    defaultValues: {
      nameParcel: parcel.name,
      nameBlock: parcel.block ?? "بلوک 1",
      parcelStatus: parcel.status,
    },

    validators: {
      onSubmit: updateFormParcel,
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
          name="nameParcel"
          validators={{
            onBlur: updateFormParcel.shape.nameParcel,
          }}
        >
          {(field) => (
            <field.TextField
              label="کد قطعه"
              placeholder="کد قطعه را وارد کنید"
              required
            />
          )}
        </form.AppField>

        <form.AppField name="nameBlock">
          {(field) => (
            <field.SelectField
              label="نام بلوک"
              options={[
                { label: "بلوک 1", value: "بلوک 1" },
                { label: "بلوک 2", value: "بلوک 2" },
                { label: "بلوک 3", value: "بلوک 3" },
                { label: "بلوک 4", value: "بلوک 4" },
              ]}
            />
          )}
        </form.AppField>

        <form.AppField name="parcelStatus">
          {(field) => (
            <field.SelectField
              label="وضعیت قطعه"
              options={[
                { label: "فعال", value: "فعال" },
                { label: "غیر فعال", value: "غیر فعال" },
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

          <form.SubmitButton label="ثبت تغییرات" />

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
