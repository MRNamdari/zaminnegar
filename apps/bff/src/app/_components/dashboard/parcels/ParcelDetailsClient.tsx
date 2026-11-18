'use client';
import type {
  ParcelDetailResponseDto as ParcelDetails,
  ParcelStatus,
} from '@zaminnegar/api-client';
import { Tabs } from '../Tabs';
import HeadDetails from '../HeadDetails';
import { useState } from 'react';
import { toPolygon } from '@/app/features/map-editor/infrastructure/api/feature-mapping';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { toPersianNumber } from '@/app/util';
import Link from 'next/link';
import { Dialog } from '../../Dialog';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/app/_lib/api.client';
import { toast } from 'react-toastify';
import ParcelsFormUpdate from './ParcelsFormUpdate';

interface ParcelDetailsProps {
  parcel: ParcelDetails;
}

const parcelStatusMap = new Map<ParcelStatus, string>([
  ['active', 'فعال'],
  ['inactive', 'غیر فعال'],
]);

export default function ParcelDetailsClient({ parcel }: ParcelDetailsProps) {
  const parcelDetailQuery = api.get('/parcels/{id}/detail', {
    path: { id: parcel.id },
  });
  const {
    data: detailsParcel = parcel,
    isError: isParcelQueryError,
    isPending: isParcelQueryPending,
  } = useQuery({
    ...parcelDetailQuery.queryOptions,
    initialData: parcel,
    staleTime: Infinity,
  });
  const router = useRouter();

  // handle delete modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const handleDeleteModal = () => {
    setIsDeleteOpen(true);
  };
  const deleteParcelMutation = useMutation({
    mutationFn: (id: string) =>
      api.client.delete('/parcels/{id}', { path: { id } }),

    onSuccess: () => {
      router.push('/parcels');
      toast.success('بلوک با موفقیت حذف شد.');
    },
    onError: () => {
      toast.error('در هنگام حذف قطعه خطایی رخ داده است.');
    },
  });

  // handle update modal
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const handleUpdateModal = () => {
    setIsUpdateOpen(true);
  };

  if (isParcelQueryPending) {
    return <p role="status">در حال بارگذاری اطلاعات قطعه...</p>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 items-center p-4 border border-slate-200/10 rounded-xl">
      {isParcelQueryError && (
        <p role="alert" className="w-full text-sm text-action-error">
          به‌روزرسانی اطلاعات قطعه با خطا مواجه شد.
        </p>
      )}
      <HeadDetails
        titleHead={`جزئیات قطعه ${detailsParcel.name}`}
        unTitleHead={parcelStatusMap.get(detailsParcel.status)}
        geometry={toPolygon(detailsParcel.boundary.geometry)}
        colorGeometry="--map-yellow"
      />
      <div className="flex flex-col gap-4 w-full">
        <Tabs
          nameTabInfo="اطلاعات کلی قطعه"
          nameTabTable="لیست مالکین"
          queryKey="parcel"
          queryValue={detailsParcel.id}
          infoComponent={
            <div className="flex flex-col gap-3 w-1/2">
              <div className="bg-surface-raised rounded-md p-4">
                <div className="flex justify-between px-1 pb-3.5 border-b border-border">
                  <span className="text-sm">کد قطعه:</span>
                  <span className="text-sm">{detailsParcel.id}</span>
                </div>

                <div className="flex justify-between px-1 py-3.5 border-b border-border">
                  <span className="text-sm">بلوک:</span>
                  <span className="text-sm">{detailsParcel.block?.name}</span>
                </div>

                <div className="flex justify-between px-1 py-3.5 border-b border-border">
                  <span className="text-sm">منطقه:</span>
                  <span className="text-sm">{detailsParcel.region.name}</span>
                </div>

                <div className="flex justify-between px-1 py-3.5 border-b border-border">
                  <span className="text-sm">تعداد مالکین:</span>
                  <span className="text-sm">
                    {toPersianNumber(detailsParcel.ownerships.length)}
                  </span>
                </div>

                <div className="flex justify-between px-1 pt-3.5">
                  <span className="text-sm">مساحت:</span>
                  <span className="text-sm">
                    {toPersianNumber(detailsParcel.areaM2)} مترمربع
                  </span>
                </div>
              </div>

              <div className="flex justify-between gap-2">
                <button
                  type="button"
                  onClick={handleUpdateModal}
                  className="w-1/2 p-3 bg-action-primary text-white rounded-md cursor-pointer transition duration-300 flex justify-center items-center gap-2"
                >
                  <FiEdit2 size={14} />
                  ویرایش
                </button>

                <button
                  type="button"
                  onClick={handleDeleteModal}
                  className="w-1/2 p-3 bg-action-error text-white rounded-md cursor-pointer transition duration-300 flex justify-center items-center gap-2"
                >
                  <FiTrash2 size={14} />
                  حذف
                </button>
              </div>
            </div>
          }
          tableComponent={
            <div>
              <div className="flex flex-col gap-3">
                {detailsParcel.ownerships?.map((o) => (
                  <div
                    key={o.ownerId}
                    className="bg-surface-raised rounded-md p-4"
                  >
                    <div className="flex justify-between px-1 pb-3.5 border-b border-border">
                      <span className="text-sm">نام مالک:</span>

                      <Link
                        href={`/owners/${o.owner?.id}`}
                        className="inline-block h-full text-blue-400 hover:underline underline-offset-4"
                      >
                        {o.owner?.name}
                      </Link>
                    </div>

                    <div className="flex justify-between px-1 pt-3.5">
                      <span className="text-sm">درصد سهم:</span>
                      <span className="text-sm">{o.sharePct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
        />
      </div>

      {/* delete parcel dialog */}
      <Dialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="حذف قطعه"
        description="آیا از حذف این قطعه اطمینان دارید؟"
        className="text-white"
      >
        <div className="flex flex-col gap-5 mt-4">
          <p className="text-sm text-slate-300">
            آیا مطمئن هستید که می‌خواهید قطعه
            <span className="text-white font-semibold mx-1">
              {detailsParcel.name}
            </span>
            را حذف کنید؟
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              className="w-1/2 py-2.5 rounded-lg bg-action-primary hover:bg-action-primary-hover transition duration-300 cursor-pointer"
            >
              انصراف
            </button>

            <button
              type="button"
              onClick={async () => {
                setIsDeleteOpen(false);
                await deleteParcelMutation.mutate(detailsParcel.id);
              }}
              className="w-1/2 py-2.5 rounded-lg bg-action-error hover:bg-action-error-hover transition duration-300 cursor-pointer"
            >
              حذف قطعه
            </button>
          </div>
        </div>
      </Dialog>

      {/* update parcel dialog */}
      <Dialog
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        title="ویرایش قطعه"
        description="اطلاعات قطعه را ویرایش کنید"
        className="text-white"
      >
        <ParcelsFormUpdate
          parcel={detailsParcel}
          onCancel={() => setIsUpdateOpen(false)}
        />
      </Dialog>
    </div>
  );
}
