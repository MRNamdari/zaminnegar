'use client';

import { Dialog as DialogPrimitive } from 'radix-ui';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { fa } from '@/messages/fa';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
}

/** Accessible modal dialog (Radix): focus trap, Esc to close, labelled by its title. */
export function Dialog({ open, onOpenChange, title, description, children }: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/50" />
        <DialogPrimitive.Content
          dir="rtl"
          className="fixed top-1/2 left-1/2 z-50 grid w-[min(440px,92vw)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-panel p-5 shadow-xl"
        >
          <div className="grid gap-1">
            <DialogPrimitive.Title className="text-base font-bold">{title}</DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-ink-soft">{description}</DialogPrimitive.Description>
          </div>
          {children}
          <DialogPrimitive.Close aria-label={fa.common.close} className="absolute end-3 top-3 rounded p-1 hover:bg-black/5">
            <X className="size-4" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
