'use client';

import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import z from 'zod';

import {
  AssignOwnerDto,
  OwnerResponseDto,
  ParcelResponseDto as Parcel,
  UpdateOwnershipDto,
  UpdateParcelDto,
  queryKeyFactory,
} from '@zaminnegar/api-client';
import { api } from '@/app/_lib/api.client';
import ParcelInformationStep, {
  parcelInformationSchema,
  type ParcelInformationValues,
} from './ParcelInformationStep';
import ParcelOwnersStep, {
  parcelOwnersSchema,
  type ParcelOwnersValues,
  type OwnerShareRow,
} from './ParcelOwnersStep';
import type { UpdateParcelFormValues } from './schema/ParcelsUpdate.schema';

interface Props {
  parcel: Parcel;
  onSubmit?: (values: z.input<typeof UpdateParcelDto>) => void;
  onCancel: () => void;
}

const toOwnerRows = (parcel: Parcel): OwnerShareRow[] =>
  (parcel.ownerships ?? []).map((ownership) => ({
    ownerId: ownership.ownerId,
    sharePct: ownership.sharePct,
  }));

const normalizePct = (value: number) =>
  Math.round((Number(value) || 0) * 100) / 100;

const OWNERS_PAGE_SIZE = 100;

const fetchAllRegisteredOwners = async (): Promise<OwnerResponseDto[]> => {
  const firstPage = await api.client.get('/owners', {
    query: { page: 1, limit: OWNERS_PAGE_SIZE },
  });
  const pageCount = Math.ceil(firstPage.total / OWNERS_PAGE_SIZE);
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
      api.client.get('/owners', {
        query: { page: index + 2, limit: OWNERS_PAGE_SIZE },
      }),
    ),
  );

  return [firstPage, ...remainingPages].flatMap((page) => page.items);
};

export default function ParcelsFormUpdate({
  onSubmit,
  onCancel,
  parcel,
}: Props) {
  const queryClient = useQueryClient();
  const ownersQuery = api.get('/owners', {
    query: { page: 1, limit: OWNERS_PAGE_SIZE },
  });
  const { data: owners = [] } = useQuery({
    queryKey: ownersQuery.queryKey,
    queryFn: fetchAllRegisteredOwners,
  });
  const savingRef = useRef(false);
  const savedOwnershipsRef = useRef(toOwnerRows(parcel));
  const [step, setStep] = useState<1 | 2>(1);
  const [parcelValues, setParcelValues] = useState<ParcelInformationValues>({
    name: parcel.name,
    status: parcel.status,
  });
  const [ownersValues, setOwnersValues] = useState<ParcelOwnersValues>({
    owners: toOwnerRows(parcel),
  });
  const [isSaving, setIsSaving] = useState(false);

  const updateParcelMutation = useMutation({
    mutationFn: ({
      id,
      value,
    }: {
      id: string;
      value: z.input<typeof UpdateParcelDto>;
    }) =>
      api.client.patch('/parcels/{id}', {
        path: { id },
        body: value,
      }),
  });
  const updateOwnershipMutation = useMutation({
    mutationFn: ({
      id,
      ownerId,
      sharePct,
    }: {
      id: string;
      ownerId: string;
      sharePct: number;
    }) =>
      api.client.patch('/parcels/{id}/owners/{ownerId}', {
        path: { id, ownerId },
        body: UpdateOwnershipDto.parse({ sharePct }),
      }),
  });
  const removeOwnershipMutation = useMutation({
    mutationFn: ({ id, ownerId }: { id: string; ownerId: string }) =>
      api.client.delete('/parcels/{id}/owners/{ownerId}', {
        path: { id, ownerId },
      }),
  });
  const assignOwnerMutation = useMutation({
    mutationFn: ({
      id,
      owner,
    }: {
      id: string;
      owner: z.input<typeof AssignOwnerDto>;
    }) =>
      api.client.post('/parcels/{id}/owners', {
        path: { id },
        body: AssignOwnerDto.parse(owner),
      }),
  });

  const invalidateRelatedQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeyFactory.endpoint('/parcels'),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeyFactory.endpoint('/parcels/{id}', {
          path: { id: parcel.id },
        }),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeyFactory.endpoint('/parcels/{id}/detail', {
          path: { id: parcel.id },
        }),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeyFactory.endpoint('/parcels/{id}/owners', {
          path: { id: parcel.id },
        }),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeyFactory.endpoint('/owners'),
      }),
    ]);
  };

  const submitChanges = async (
    nextParcelValues: ParcelInformationValues,
    nextOwnersValues: ParcelOwnersValues,
  ) => {
    if (savingRef.current) return;

    const parcelResult = parcelInformationSchema.safeParse(nextParcelValues);
    const ownersResult = parcelOwnersSchema.safeParse(nextOwnersValues);
    if (!parcelResult.success || !ownersResult.success) {
      toast.error('لطفاً اطلاعات قطعه و مالکین را بررسی کنید.');
      setStep(parcelResult.success ? 2 : 1);
      return;
    }

    savingRef.current = true;
    setIsSaving(true);
    let succeeded = false;

    try {
      const validatedParcel = parcelResult.data;
      const validatedOwners = ownersResult.data.owners;

      await updateParcelMutation.mutateAsync({
        id: parcel.id,
        value: validatedParcel,
      });

      const currentOwners = savedOwnershipsRef.current;
      const currentById = new Map(
        currentOwners.map((owner) => [owner.ownerId, owner]),
      );
      const desiredById = new Map(
        validatedOwners.map((owner) => [owner.ownerId, owner]),
      );
      const removedOwnershipOwnerIds = currentOwners
        .filter((owner) => !desiredById.has(owner.ownerId))
        .map((owner) => owner.ownerId);
      const changedShares = validatedOwners.flatMap((owner) => {
        const current = currentById.get(owner.ownerId);
        return current &&
          normalizePct(current.sharePct) !== normalizePct(owner.sharePct)
          ? [{ owner, current }]
          : [];
      });
      const addedOwners = validatedOwners.filter(
        (owner) => !currentById.has(owner.ownerId),
      );
      const decreasedShares = changedShares.filter(
        ({ owner, current }) => owner.sharePct < current.sharePct,
      );
      const increasedShares = changedShares.filter(
        ({ owner, current }) => owner.sharePct >= current.sharePct,
      );

      for (const { owner } of decreasedShares) {
        await updateOwnershipMutation.mutateAsync({
          id: parcel.id,
          ownerId: owner.ownerId,
          sharePct: owner.sharePct,
        });
        savedOwnershipsRef.current = savedOwnershipsRef.current.map((saved) =>
          saved.ownerId === owner.ownerId
            ? { ...saved, sharePct: owner.sharePct }
            : saved,
        );
      }

      for (const ownerId of removedOwnershipOwnerIds) {
        await removeOwnershipMutation.mutateAsync({
          id: parcel.id,
          ownerId,
        });
        savedOwnershipsRef.current = savedOwnershipsRef.current.filter(
          (saved) => saved.ownerId !== ownerId,
        );
      }

      for (const { owner } of increasedShares) {
        await updateOwnershipMutation.mutateAsync({
          id: parcel.id,
          ownerId: owner.ownerId,
          sharePct: owner.sharePct,
        });
        savedOwnershipsRef.current = savedOwnershipsRef.current.map((saved) =>
          saved.ownerId === owner.ownerId
            ? { ...saved, sharePct: owner.sharePct }
            : saved,
        );
      }

      for (const owner of addedOwners) {
        const requestBody = AssignOwnerDto.parse(owner);
        await assignOwnerMutation.mutateAsync({
          id: parcel.id,
          owner: requestBody,
        });
        savedOwnershipsRef.current = [
          ...savedOwnershipsRef.current,
          { ...requestBody },
        ];
      }

      await invalidateRelatedQueries();
      onSubmit?.({
        name: validatedParcel.name,
        status: validatedParcel.status,
        ownersShip: validatedOwners.map((owner) => ({
          ownerId: owner.ownerId,
          share: owner.sharePct,
        })),
      });
      toast.success('قطعه و مالکین با موفقیت به‌روزرسانی شدند.');
      succeeded = true;
    } catch (error) {
      try {
        await invalidateRelatedQueries();
      } catch (refreshError) {
        toast.error(
          refreshError instanceof Error
            ? `به‌روزرسانی فهرست‌ها با خطا مواجه شد: ${refreshError.message}`
            : 'به‌روزرسانی فهرست‌ها با خطا مواجه شد.',
        );
      }
      toast.error(
        error instanceof Error
          ? `ذخیره تغییرات با خطا مواجه شد: ${error.message}`
          : 'ذخیره تغییرات با خطا مواجه شد.',
      );
    } finally {
      savingRef.current = false;
      setIsSaving(false);
      if (succeeded) onCancel();
    }
  };

  return step === 1 ? (
    <ParcelInformationStep
      initialValues={parcelValues}
      onValuesChange={setParcelValues}
      onNext={(values) => {
        setParcelValues(values);
        setStep(2);
      }}
      onCancel={onCancel}
    />
  ) : (
    <ParcelOwnersStep
      parcel={parcel}
      owners={owners}
      initialValues={ownersValues}
      isSaving={isSaving}
      onValuesChange={setOwnersValues}
      onBack={(values) => {
        setOwnersValues(values);
        setStep(1);
      }}
      onSave={(values) => {
        setOwnersValues(values);
        void submitChanges(parcelValues, values);
      }}
    />
  );
}
