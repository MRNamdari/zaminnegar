'use client';

import type { BlockDto } from '@zaminnegar/api-client';
import { toast } from 'sonner';
import { Dialog } from '@/components/ui/dialog';
import { fa } from '@/messages/fa';
import { CreateBlockForm } from './create-block-form';

interface CreateBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  regionId: string;
  onCreated: (block: BlockDto) => void;
}

export function CreateBlockDialog({ open, onOpenChange, regionId, onCreated }: CreateBlockDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={fa.blocks.new} description={fa.blocks.dialogHint}>
      <CreateBlockForm
        regionId={regionId}
        onCancel={() => onOpenChange(false)}
        onCreated={(block) => {
          toast.success(fa.blocks.created);
          onOpenChange(false);
          onCreated(block);
        }}
      />
    </Dialog>
  );
}
