import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface StateMessageProps {
  title?: string;
  children?: ReactNode;
  tone?: 'neutral' | 'error';
  action?: ReactNode;
}

/** Empty / error / informational block used by lists and panels. */
export function StateMessage({ title, children, tone = 'neutral', action }: StateMessageProps) {
  return (
    <div
      className={cn(
        'grid gap-1.5 rounded-lg border border-dashed p-4 text-ink-soft',
        tone === 'error' ? 'border-danger/40 bg-danger/5 text-danger' : 'border-line',
      )}
    >
      {title && <strong className={cn('text-ink', tone === 'error' && 'text-danger')}>{title}</strong>}
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
