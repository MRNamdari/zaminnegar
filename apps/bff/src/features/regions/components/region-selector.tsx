'use client';

import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { fa } from '@/messages/fa';
import { CreateBlockDialog } from '@/features/blocks/components/create-block-dialog';
import { useRegions } from '../hooks/use-regions';
import { CreateRegionDialog } from './create-region-dialog';

/** Region dropdown and creation actions, used in the main workspace header. */
export function RegionSelector() {
  const { data, isPending } = useRegions();
  const [creatingRegion, setCreatingRegion] = useState(false);
  const [creatingBlock, setCreatingBlock] = useState(false);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('');

  useEffect(() => {
    if (!data?.items.length) {
      setSelectedRegionId('');
      return;
    }
    if (!selectedRegionId || !data.items.some((region) => region.id === selectedRegionId)) {
      setSelectedRegionId(data.items[0].id);
    }
  }, [data, selectedRegionId]);

  return (
    <div className="flex items-center gap-2">
      <select
        aria-label={fa.regions.select}
        value={selectedRegionId}
        disabled={isPending || !data?.items.length}
        onChange={(event) => setSelectedRegionId(event.target.value)}
        className="h-9 max-w-64 min-w-44 rounded-md border border-white/20 bg-white/10 px-2 text-white"
      >
        {data?.items.map((region) => (
          <option key={region.id} value={region.id} className="text-ink">
            {region.name}
          </option>
        ))}
      </select>
      <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => setCreatingRegion(true)}>
        <Plus className="size-4" />
        {fa.regions.new}
      </Button>
      <Button
        variant="ghost"
        className="text-white hover:bg-white/10 disabled:opacity-40"
        onClick={() => setCreatingBlock(true)}
        disabled={!selectedRegionId}
      >
        {fa.blocks.new}
      </Button>
      <CreateRegionDialog open={creatingRegion} onOpenChange={setCreatingRegion} onCreated={(region) => setSelectedRegionId(region.id)} />
      {selectedRegionId && (
        <CreateBlockDialog open={creatingBlock} onOpenChange={setCreatingBlock} regionId={selectedRegionId} onCreated={() => undefined} />
      )}
    </div>
  );
}
