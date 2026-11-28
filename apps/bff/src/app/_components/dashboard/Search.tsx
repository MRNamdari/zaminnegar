'use client';

import { Search as SearchIcon } from 'lucide-react';
import { useAppForm } from '../form/hooks/form';

interface SearchProps {
  onSearch: (value: string) => void;
}

export default function Search({ onSearch }: SearchProps) {
  const form = useAppForm({
    defaultValues: {
      search: '',
    },
    onSubmit: async ({ value }) => {
      onSearch(value.search.trim());
    },
  });

  return (
    <div dir="rtl" className="flex items-center bg-background p-4 rounded-2xl">
      <form
        className="flex items-center w-full gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <div className="w-[85%]">
          <form.AppForm>
            <form.AppField name="search">
              {(field) => <field.TextField placeholder="جستجو..." />}
            </form.AppField>
          </form.AppForm>
        </div>

        <div className="w-[15%]">
          <form.AppForm>
            <form.SubmitButton label="جستجو" icon={SearchIcon} />
          </form.AppForm>
        </div>
      </form>
    </div>
  );
}
