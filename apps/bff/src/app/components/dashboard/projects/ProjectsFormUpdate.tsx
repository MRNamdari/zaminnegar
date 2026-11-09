
"use client";
import { useAppForm } from "../../form/hooks/form";
import {
  updateFormProject,
  UpdateFormProjectValues,
} from "./schema/ProjectsUpdate.schema";
import { Project } from "./ProjectTable";

interface Props {
  project: Project;
  onSubmit: (values: UpdateFormProjectValues) => void;
  onCancel: () => void;
}

export default function ProjectsFormUpdate({
  onSubmit,
  onCancel,
  project,
}: Props) {

  const form = useAppForm({
    defaultValues: {
      name: project.name,
      description: project.description,
      status: project.status,
    },

    validators: {
      onSubmit: updateFormProject,
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
            onBlur: updateFormProject.shape.name,
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
            onBlur: updateFormProject.shape.description,
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

          <form.SubmitButton label="ثبت تغییرات" />
        </div>
      </form>
    </form.AppForm>
  );
}
