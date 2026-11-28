'use client';

import { useState } from 'react';

import { useAppForm } from './form/hooks/form';
import { Dialog } from './Dialog';

// ========================================
// Types
// ========================================

interface DialogPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title?: string;
  description?: string;

  confirmText?: string;
  cancelText?: string;

  isLoading?: boolean;

  onConfirm: () => void | Promise<void>;
}

// ========================================
// Component
// ========================================

export default function DialogPopup({
  open,
  onOpenChange,

  title = 'حذف آیتم',
  description = 'آیا از حذف این آیتم اطمینان دارید؟',

  confirmText = 'حذف',
  cancelText = 'انصراف',

  isLoading = false,

  onConfirm,
}: DialogPopupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loading = isLoading || isSubmitting;

  const form = useAppForm({
    defaultValues: {},
    onSubmit: async () => {
      if (loading) return;

      try {
        setIsSubmitting(true);

        await onConfirm();

        onOpenChange(false);
      } catch (error) {
        console.error('خطا در حذف آیتم:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!loading) {
          onOpenChange(value);
        }
      }}
      title={title}
      description={description}
    >
      <div dir="rtl" className="flex items-center justify-start gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={() => onOpenChange(false)}
          className="p-4 rounded-lg bg-surface-muted font-medium text-dark hover:bg-surface-muted-hover transition duration-300 cursor-pointer disabled:bg-action-primary/50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {cancelText}
        </button>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <button className="rounded-xl p-4 text-action-error font-medium bg-action-error/10 dark:bg-action-error/70 dark:text-current dark:hover:bg-action-error-hover hover:bg-action-error/20 transition duration-300 flex items-center gap-3 cursor-pointer">حذف پروژه</button>
        </form>
      </div>
    </Dialog>
  );
}
