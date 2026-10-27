'use client';

import { useIsMutating } from '@tanstack/react-query';
import { Check, Loader2 } from 'lucide-react';
import { parcelKeys } from '@/features/parcels/query-keys';
import { fa } from '@/messages/fa';

/** "Saving…" while any parcel mutation is in flight, otherwise "Saved". Failures raise a toast. */
export function SyncStatus() {
  const pending = useIsMutating({ mutationKey: parcelKeys.mutations });
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-1.5 text-[13px] text-white/90">
      {pending > 0 ? <Loader2 className="size-3.5 animate-spin text-saffron" /> : <Check className="size-3.5 text-emerald-300" />}
      <span>{pending > 0 ? fa.sync.saving : fa.sync.saved}</span>
    </div>
  );
}
