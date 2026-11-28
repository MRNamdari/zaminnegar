import { useAppForm } from '@/app/_components/form/hooks/form';

interface CreateProjectValues {
  name: string;
  description: string;
}

interface ProjectsCreateFormProps {
  onCreate: (value: CreateProjectValues) => void | Promise<void>;
}

export default function ProjectsCreateForm({
  onCreate,
}: ProjectsCreateFormProps) {
  const form = useAppForm({
    defaultValues: {
      name: '',
      description: '',
    },
    onSubmit: async ({ value }) => {
      await onCreate(value);
    },
  });

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
        <form.SubmitButton label="ایجاد پروژه" />
      </form.AppForm>
    </form>
  );
}
