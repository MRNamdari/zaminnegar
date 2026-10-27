'use client';

import { useId, type TextareaHTMLAttributes } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFieldContext } from '@/lib/form/form-context';
import { FieldError } from './field-error';

type TextareaFieldProps = { label: string } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange' | 'onBlur' | 'name' | 'id'>;

/** Multi-line input bound to the surrounding TanStack Form field. */
export function TextareaField({ label, ...textareaProps }: TextareaFieldProps) {
  const field = useFieldContext<string>();
  const id = useId();
  const { errors, isTouched, isDirty } = field.state.meta;
  const visibleErrors = isTouched || isDirty ? errors : [];
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        name={field.name}
        value={field.state.value}
        aria-invalid={visibleErrors.length > 0}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        {...textareaProps}
      />
      <FieldError errors={visibleErrors} />
    </div>
  );
}
