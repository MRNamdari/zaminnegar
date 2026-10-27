import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

/** Styled text input. */
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-9 w-full rounded-md border border-line bg-white px-3 placeholder:text-ink-soft/70 aria-invalid:border-danger',
        className,
      )}
      {...props}
    />
  );
}
