'use client';

import { useId } from 'react';
import { Label } from '@/components/ui/label';
import { useFieldContext } from '@/lib/form/form-context';

/** Native color picker bound to the surrounding TanStack Form field (`#rrggbb`). */
export function ColorField({ label }: { label: string }) {
  const field = useFieldContext<string>();
  const id = useId();
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <input
        id={id}
        type="color"
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        className="h-9 w-full cursor-pointer rounded-md border border-line bg-white p-1"
      />
    </div>
  );
}
