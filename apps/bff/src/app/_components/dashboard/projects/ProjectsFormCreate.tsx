
import {
  createFormProject,
  ProjectFormValue,
} from "./schema/ProjectsCreate.schema";
import { useAppForm } from "../../form/hooks/form";

interface Props {
  onSubmit: (values: ProjectFormValue) => void;
  onCancel: () => void;
}

const initialValues: ProjectFormValue = {
  name: "",
  description: "",
  status: "فعال",
};

export default function ProjectsFormCreate({
  onSubmit,
  onCancel,
}: Props) {
  const form = useAppForm({
    defaultValues: initialValues,
    validators: {
      onSubmit: createFormProject,
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
            onBlur: createFormProject.shape.name,
          }}
        >
          {(field) => (
            <field.TextField
              label="نام پروژه"
              placeholder="نام پروژه را وارد کنید"
              required
            />
          )}
        </form.AppField>

        <form.AppField
          name="description"
          validators={{
            onBlur: createFormProject.shape.description,
          }}
        >
          {(field) => (
            <field.TextareaField
              label="توضیحات پروژه"
              placeholder="توضیحات پروژه را وارد کنید"
            />
          )}
        </form.AppField>

        <form.AppField name="status">
          {(field) => (
            <field.SelectField
              label="وضعیت پروژه"
              options={[
                { label: "فعال", value: "فعال" },
                { label: "غیر فعال", value: "غیر فعال" },
                { label: "در انتظار", value: "در انتظار" },
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

          <form.SubmitButton label="ثبت پروژه" />
        </div>
      </form>
    </form.AppForm>
  );
}
