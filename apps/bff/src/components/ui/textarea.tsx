import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

/** Styled multi-line input. */
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn('w-full rounded-md border border-line bg-white px-3 py-2 aria-invalid:border-danger', className)}
      {...props}
    />
  );
}
