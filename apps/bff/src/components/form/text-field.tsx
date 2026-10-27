'use client';

import { useId, type InputHTMLAttributes } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFieldContext } from '@/lib/form/form-context';
import { FieldError } from './field-error';

type TextFieldProps = { label: string } & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onBlur' | 'name' | 'id'>;

/** Text input bound to the surrounding TanStack Form field. */
export function TextField({ label, ...inputProps }: TextFieldProps) {
  const field = useFieldContext<string>();
  const id = useId();
  const { errors, isTouched, isDirty } = field.state.meta;
  const visibleErrors = isTouched || isDirty ? errors : [];
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={field.name}
        value={field.state.value}
        aria-invalid={visibleErrors.length > 0}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        {...inputProps}
      />
      <FieldError errors={visibleErrors} />
    </div>
  );
}
