import type { LabelHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

/** Form label. */
export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('text-[13px] text-ink-soft', className)} {...props} />;
}
