import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-field text-white hover:bg-field-dark',
        accent: 'bg-saffron text-ink hover:brightness-95',
        outline: 'border border-line bg-white hover:bg-panel',
        ghost: 'hover:bg-black/5',
        destructive: 'text-danger hover:bg-danger/10',
        toolbar: 'hover:bg-black/5 data-[active=true]:bg-field data-[active=true]:text-white',
      },
      size: { default: 'h-9 px-3', sm: 'h-8 px-2.5', icon: 'size-9' },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

/** Styled button. Defaults to `type="button"` so it never submits a form by accident. */
export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
