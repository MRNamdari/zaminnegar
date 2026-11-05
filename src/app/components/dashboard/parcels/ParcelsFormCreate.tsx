
import { useRouter } from "next/navigation";
import { createFormParcel, ParcelFormValue } from "./schema/ParcelsCreate.schema";
import { useAppForm } from "../../form/hooks/form";


interface Props {
  onSubmit: (values: ParcelFormValue) => void;
  onCancel: () => void;
}

const initialValues: ParcelFormValue = {
  nameParcel: "",
  nameBlock: "بلوک 1",
  parcelStatus: "فعال",
};

export default function ParcelsFormCreate({ onSubmit, onCancel }: Props) {
    const router = useRouter();
      const form = useAppForm({
        defaultValues: initialValues,
        validators: {
          onSubmit: createFormParcel,
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
            name="nameParcel"
            validators={{
              onBlur: createFormParcel.shape.nameParcel,
            }}
          >
            {(field) => (
              <field.TextField
                label="کد قطعه"
                placeholder="نام قطعه را وارد کنید"
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

            <form.SubmitButton label="برو به نقشه" />
          </div>
        </form>
      </form.AppForm>
    );
}