'use client';

import { useMemo, useState } from 'react';
import { useMap } from 'react-map-gl/maplibre';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { StateMessage } from '@/components/ui/state-message';
import { FIT_BOUNDS_OPTIONS, getBounds, toLngLatBounds } from '@/features/map/lib/geometry';
import { WORKSPACE_MAP_ID } from '@/features/map/types';
import { useWorkspace } from '@/features/workspace/context/workspace-context';
import { cn } from '@/lib/utils/cn';
import { formatNumber } from '@/lib/utils/format';
import { fa } from '@/messages/fa';
import { useDeleteAllParcels } from '../hooks/use-delete-all-parcels';
import { useParcels } from '../hooks/use-parcels';

/** Sidebar list of the project's parcels: filter, select (also zooms to the parcel) and delete all. */
export function ParcelList() {
  const { projectId, selectedParcelId, selectParcel, parcelFilter, setParcelFilter } = useWorkspace();
  const { data: parcels = [], isPending, isError, refetch } = useParcels(projectId);
  const map = useMap()[WORKSPACE_MAP_ID];
  const deleteAll = useDeleteAllParcels(projectId);
  const [confirmingDeleteAll, setConfirmingDeleteAll] = useState(false);

  const visible = useMemo(() => {
    const query = parcelFilter.trim().toLowerCase();
    return query ? parcels.filter((parcel) => parcel.name.toLowerCase().includes(query)) : parcels;
  }, [parcels, parcelFilter]);

  return (
    <section aria-label={fa.panels.list} className="flex h-full min-h-0 flex-col gap-3 p-4">
      <header className="flex items-baseline justify-between">
        <h2 className="text-[15px] font-bold">{fa.parcels.title}</h2>
        <span className="text-xs text-ink-soft">{fa.parcels.count(parcels.length)}</span>
      </header>

      <Input type="search" value={parcelFilter} placeholder={fa.parcels.filter} aria-label={fa.parcels.filter} disabled={parcels.length === 0} onChange={(event) => setParcelFilter(event.target.value)} />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isPending && <p className="text-ink-soft">{fa.common.loading}</p>}
        {isError && (
          <StateMessage tone="error" title={fa.parcels.loadFailed} action={<Button onClick={() => void refetch()}>{fa.common.retry}</Button>} />
        )}
        {!isPending && !isError && parcels.length === 0 && (
          <StateMessage title={fa.parcels.emptyTitle}>{fa.parcels.emptyHint}</StateMessage>
        )}
        {parcels.length > 0 && visible.length === 0 && <p className="text-ink-soft">{fa.parcels.noMatch}</p>}

        <ul className="grid gap-1">
          {visible.map((parcel) => (
            <li key={parcel.id}>
              <button
                type="button"
                aria-current={parcel.id === selectedParcelId}
                onClick={() => {
                  selectParcel(parcel.id);
                  map?.fitBounds(toLngLatBounds(getBounds(parcel.geometry)), FIT_BOUNDS_OPTIONS);
                }}
                className={cn(
                  'grid w-full grid-cols-[1.25rem_1fr_auto] items-center gap-2.5 rounded-md border border-transparent px-2.5 py-2 text-start hover:bg-black/5',
                  parcel.id === selectedParcelId && 'border-saffron bg-saffron/10',
                )}
              >
                <span className="size-5 rounded border-2 border-white shadow-[0_0_0_1px_var(--color-line)]" style={{ background: parcel.fillColor }} />
                <span className="truncate">{parcel.name}</span>
                <span className="text-xs text-ink-soft">
                  {formatNumber(parcel.areaM2 / 10_000)} {fa.properties.hectares}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {parcels.length > 1 && (
        <Button variant="destructive" onClick={() => setConfirmingDeleteAll(true)}>
          {fa.parcels.deleteAll}
        </Button>
      )}
      <ConfirmDialog
        open={confirmingDeleteAll}
        onOpenChange={setConfirmingDeleteAll}
        title={fa.parcels.deleteAllTitle}
        description={fa.parcels.deleteAllHint(parcels.length)}
        onConfirm={() => deleteAll.mutate(undefined, { onSuccess: () => selectParcel(null) })}
      />
    </section>
  );
}
