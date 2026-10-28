'use client';

import { Plus, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAppForm } from '@/lib/form/use-app-form';
import { fa } from '@/messages/fa';
import { useAssignParcelOwner } from '../hooks/use-assign-parcel-owner';
import { useOwners } from '../hooks/use-owners';
import { useParcelOwners } from '../hooks/use-parcel-owners';
import { assignParcelOwnerSchema } from '../schemas/assign-parcel-owner.schema';
import { CreateOwnerDialog } from './create-owner-dialog';

interface ParcelOwnershipPanelProps {
  parcelId: string;
}

export function ParcelOwnershipPanel({ parcelId }: ParcelOwnershipPanelProps) {
  const { data: ownersData, isPending: ownersPending } = useOwners();
  const owners = ownersData?.items ?? [];
  const { data: assignments = [] } = useParcelOwners(parcelId);
  const assignOwner = useAssignParcelOwner(parcelId);
  const [openCreateOwner, setOpenCreateOwner] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);

  const form = useAppForm({
    defaultValues: { ownerId: '', share: 0.5 },
    validators: { onChange: assignParcelOwnerSchema },
    onSubmit: async ({ value }) => {
      await assignOwner.mutateAsync({ ownerId: value.ownerId, share: value.share });
      setOpenAssign(false);
    },
  });

  useEffect(() => {
    if (!owners.length) return;
    if (!form.state.values.ownerId) {
      form.setFieldValue('ownerId', owners[0].id);
    }
  }, [owners, form]);

  return (
    <div className="grid gap-3 rounded-lg border border-line bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold">{fa.owners.title}</h3>
        <Button variant="outline" size="sm" onClick={() => setOpenAssign(true)}>
          <UserRound className="size-3.5" />
          {fa.owners.assign}
        </Button>
      </div>

      {assignments.length ? (
        <ul className="grid gap-2">
          {assignments.map((assignment) => (
            <li key={assignment.ownerId} className="flex items-center justify-between rounded-md bg-panel px-2 py-1.5 text-sm">
              <span>{fa.owners.unnamed}</span>
              <span className="font-medium">{Math.round((assignment.share ?? 0) * 100)}%</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-soft">{fa.owners.empty}</p>
      )}

      <Button variant="ghost" size="sm" onClick={() => setOpenCreateOwner(true)} className="justify-start px-0 text-ink">
        <Plus className="size-4" />
        {fa.owners.new}
      </Button>

      <CreateOwnerDialog
        open={openCreateOwner}
        onOpenChange={setOpenCreateOwner}
        onCreated={() => {
          setOpenCreateOwner(false);
          setOpenAssign(true);
        }}
      />

      {openAssign && (
        <div className="grid gap-3 rounded-lg border border-line bg-panel p-3">
          <h4 className="text-sm font-bold">{fa.owners.assign}</h4>
          <label className="grid gap-1">
            <span className="text-sm text-ink-soft">{fa.owners.ownerLabel}</span>
            <select
              value={form.state.values.ownerId}
              onChange={(event) => form.setFieldValue('ownerId', event.target.value)}
              className="rounded-md border border-line bg-white px-2 py-2 text-sm"
              disabled={ownersPending || !owners.length}
            >
              {!owners.length && <option value="">{fa.owners.noOwners}</option>}
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name}
                </option>
              ))}
            </select>
          </label>

          <form.AppField name="share">{(field) => <field.SliderField label={fa.owners.shareLabel} min={0} max={1} step={0.01} formatValue={(value) => `${value.toFixed(2)}`} />}</form.AppField>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpenAssign(false)}>
              {fa.common.cancel}
            </Button>
            <Button size="sm" onClick={() => void form.handleSubmit()}>
              {fa.common.create}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
