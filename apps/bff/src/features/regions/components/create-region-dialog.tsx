'use client';

import type { RegionDto } from '@zaminnegar/api-client';
import { toast } from 'sonner';
import { Dialog } from '@/components/ui/dialog';
import { fa } from '@/messages/fa';
import { CreateRegionForm } from './create-region-form';

interface CreateRegionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (region: RegionDto) => void;
}

export function CreateRegionDialog({ open, onOpenChange, onCreated }: CreateRegionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={fa.regions.new} description={fa.regions.dialogHint}>
      <CreateRegionForm
        onCancel={() => onOpenChange(false)}
        onCreated={(region) => {
          toast.success(fa.regions.created);
          onOpenChange(false);
          onCreated(region);
        }}
      />
    </Dialog>
  );
}
