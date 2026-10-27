'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useFormContext } from '@/lib/form/form-context';

/** Submit button that disables itself while the form is invalid or submitting. */
export function SubmitButton({ children }: { children: ReactNode }) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
      {([canSubmit, isSubmitting]) => (
        <Button type="submit" disabled={!canSubmit || isSubmitting}>
          {children}
        </Button>
      )}
    </form.Subscribe>
  );
}
