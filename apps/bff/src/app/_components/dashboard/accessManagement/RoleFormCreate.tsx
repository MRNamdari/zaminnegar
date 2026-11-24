import { createFormRole, RoleFormValue } from './schema/RoleFormCreate.schema';
import { useAppForm } from '../../form/hooks/form';

interface Props {
  onSubmit: (values: RoleFormValue) => void;
  onCancel: () => void;
}

const initialValues: RoleFormValue = {
  name: '',
  description: '',
};

export default function RoleFormCreate({ onSubmit, onCancel }: Props) {
  const form = useAppForm({
    defaultValues: initialValues,
    validators: {
      onSubmit: createFormRole,
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
        <div className="flex items-center gap-3 mt-2 justify-end">
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

        <div className="flex items-center gap-2">
          <form.AppField
            name="name"
            validators={{
              onBlur: createFormRole.shape.name,
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
              onBlur: createFormRole.shape.description,
            }}
          >
            {(field) => (
              <field.TextField
                label="توضیحات پروژه"
                placeholder="توضیحات پروژه را وارد کنید"
              />
            )}
          </form.AppField>
        </div>
      </form>
    </form.AppForm>
  );
}
