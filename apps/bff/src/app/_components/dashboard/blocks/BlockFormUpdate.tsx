'use client';

import { BlockDetailResponseDto, UpdateBlockDto } from '@zaminnegar/api-client';
import type { z } from 'zod';
import { useAppForm } from '@/app/_components/form/hooks/form';

interface Props {
  block: BlockDetailResponseDto;
  onSubmit: (values: z.input<typeof UpdateBlockDto>) => void;
  onCancel: () => void;
}

export default function UpdateBlockForm({ onSubmit, onCancel, block }: Props) {

  const defaultValues: z.input<typeof UpdateBlockDto> = {
    name: block.name,
    description: '',
    status: block.status,
  };

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: UpdateBlockDto,
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
            onBlur: UpdateBlockDto.shape.name,
          }}
        >
          {(field) => (
            <field.TextField
              label="کد بلوک"
              placeholder="کد بلوک را وارد کنید"
              required
            />
          )}
        </form.AppField>

        <form.AppField
          name="description"
          validators={{
            onBlur: UpdateBlockDto.shape.description,
          }}
        >
          {(field) => (
            <field.TextareaField
              label="توضیحات بلوک"
              placeholder="توضیحات بلوک را وارد کنید"
            />
          )}
        </form.AppField>

        <form.AppField
          name="status"
          validators={{
            onBlur: UpdateBlockDto.shape.status,
          }}
        >
          {(field) => (
            <field.SelectField
              label="وضعیت بلوک"
              required
              options={[
                { label: 'فعال', value: 'active' },
                { label: 'غیرفعال', value: 'inactive' },
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
            className="w-full py-2.5 rounded-lg bg-action-error hover:bg-action-error-hover transition duration-300 cursor-pointer"
          >
            انصراف
          </button>

          <form.SubmitButton label="ثبت" />
        </div>
      </form>
    </form.AppForm>
  );
}
