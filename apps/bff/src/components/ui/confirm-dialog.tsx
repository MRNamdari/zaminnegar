'use client';

import { fa } from '@/messages/fa';
import { Button } from './button';
import { Dialog } from './dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  /** Label of the confirming button; defaults to "Delete". */
  confirmLabel?: string;
  onConfirm: () => void;
}

/** Reusable "are you sure?" dialog for destructive actions. */
export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = fa.common.delete, onConfirm }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} description={description}>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          {fa.common.cancel}
        </Button>
        <Button
          className="bg-danger text-white hover:bg-danger/90"
          onClick={() => {
            onConfirm();
            onOpenChange(false);
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
