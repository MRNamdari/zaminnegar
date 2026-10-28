'use client';

import type { OwnerDto } from '@zaminnegar/api-client';
import { toast } from 'sonner';
import { Dialog } from '@/components/ui/dialog';
import { fa } from '@/messages/fa';
import { CreateOwnerForm } from './create-owner-form';

interface CreateOwnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (owner: OwnerDto) => void;
}

export function CreateOwnerDialog({ open, onOpenChange, onCreated }: CreateOwnerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={fa.owners.new} description={fa.owners.dialogHint}>
      <CreateOwnerForm
        onCancel={() => onOpenChange(false)}
        onCreated={(owner) => {
          toast.success(fa.owners.created);
          onOpenChange(false);
          onCreated(owner);
        }}
      />
    </Dialog>
  );
}
