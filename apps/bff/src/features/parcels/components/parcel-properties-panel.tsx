'use client';

import { StateMessage } from '@/components/ui/state-message';
import { useWorkspace } from '@/features/workspace/context/workspace-context';
import { formatNumber } from '@/lib/utils/format';
import { fa } from '@/messages/fa';
import { useParcels } from '../hooks/use-parcels';
import { ParcelPropertiesForm } from './parcel-properties-form';

/** Right-hand panel: properties form and computed area of the selected parcel. */
export function ParcelPropertiesPanel() {
  const { projectId, selectedParcelId } = useWorkspace();
  const { data: parcels = [] } = useParcels(projectId);
  const parcel = parcels.find((candidate) => candidate.id === selectedParcelId);

  return (
    <section aria-label={fa.panels.properties} className="grid content-start gap-4 p-4">
      <h2 className="text-[15px] font-bold">{fa.properties.title}</h2>
      {parcel ? (
        <>
          <ParcelPropertiesForm key={parcel.id} projectId={projectId} parcel={parcel} />
          <dl className="grid gap-0.5 rounded-lg border border-line bg-white px-3 py-2.5">
            <dt className="text-xs text-ink-soft">{fa.properties.area}</dt>
            <dd className="text-[15px]">
              <strong>{formatNumber(parcel.areaM2)}</strong> {fa.properties.squareMeters}
            </dd>
            <dd className="text-[15px]">
              <strong>{formatNumber(parcel.areaM2 / 10_000)}</strong> {fa.properties.hectares}
            </dd>
          </dl>
          <p className="text-xs text-ink-soft">{fa.properties.areaDisclaimer}</p>
        </>
      ) : (
        <StateMessage>{fa.properties.empty}</StateMessage>
      )}
    </section>
  );
}
