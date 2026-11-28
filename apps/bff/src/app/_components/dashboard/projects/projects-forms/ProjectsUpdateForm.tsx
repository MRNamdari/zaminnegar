import { useAppForm } from '@/app/_components/form/hooks/form';
import { useEffect } from 'react';

interface UpdateProjectValues {
  name: string;
  description: string;
}

interface ProjectsUpdateFormProps {
  project?: {
    id: string;
    name: string;
    description?: string;
  };
  onUpdate: (value: UpdateProjectValues) => void | Promise<void>;
}

export default function ProjectsUpdateForm({
  project,
  onUpdate,
}: ProjectsUpdateFormProps) {
  let defaultValues: UpdateProjectValues = {
    name: project?.name ?? '',
    description: project?.description ?? '',
  };

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await onUpdate(value);
    },
  });
  useEffect(() => {
    form.reset({
      name: project?.name ?? '',
      description: project?.description ?? '',
    });
  }, [project]);
  return (
    <form
      dir="rtl"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      className="space-y-5"
    >
      <form.AppField name="name">
        {(field) => (
          <field.TextField
            label="نام پروژه"
            placeholder="نام پروژه را وارد کنید"
          />
        )}
      </form.AppField>

      <form.AppField name="description">
        {(field) => (
          <field.TextareaField
            label="توضیحات"
            placeholder="توضیحات پروژه را وارد کنید"
          />
        )}
      </form.AppField>

      <form.AppForm>
        <form.SubmitButton label="ذخیره تغییرات" />
      </form.AppForm>
    </form>
  );
}
