'use client';
import type {
  BlockDetailResponseDto as BlockDetails,
  BlockStatus,
  ParcelResponseDto,
  UpdateBlockDto,
} from '@zaminnegar/api-client';
import HeadDetails from '../HeadDetails';
import { Tabs } from '../Tabs';
import { toPolygon } from '@/app/features/map-editor/infrastructure/api/feature-mapping';
import { toPersianNumber } from '@/app/util';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { Dialog } from '../../Dialog';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/app/_lib/api.client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import UpdateBlockForm from './BlockFormUpdate';
import z from 'zod';
import ParcelsTable from '../parcels/ParcelsTable';
import ParcelsFormUpdate from '../parcels/ParcelsFormUpdate';

interface BlockDetailsProps {
  block: BlockDetails;
}

const blockStatusMap = new Map<BlockStatus, string>([
  ['active', 'فعال'],
  ['inactive', 'غیر فعال'],
]);

export default function BlockDetailsClient({ block }: BlockDetailsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [detailsBlock, setDetailsBlock] = useState<BlockDetails>(block);

  // handle delete modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const handleDeleteModal = () => {
    setIsDeleteOpen(true);
  };
  const deleteBlockMutation = useMutation({
    mutationFn: (id: string) =>
      api.client.delete('/blocks/{id}', { path: { id } }),

    onSuccess: () => {
      router.push('/blocks');
      toast.success('بلوک با موفقیت حذف شد.');
    },
    onError: () => {
      toast.error(
        `بلوک دارای ${toPersianNumber(detailsBlock.parcels.length)} قطعه است و قابل حذف نمیباشد.`,
      );
    },
  });

  // handle update modal
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  const updateBlockMutation = useMutation({
    mutationFn: ({
      id,
      value,
    }: {
      id: string;
      value: z.input<typeof UpdateBlockDto>;
    }) =>
      api.client.patch('/blocks/{id}', {
        path: { id },
        body: value,
      }),

    onSuccess: (_, variables) => {
      setDetailsBlock((prevBlock) => ({
        ...prevBlock,
        name: variables.value.name ?? prevBlock.name,
        description: variables.value.description ?? prevBlock.description,
        status: variables.value.status ?? prevBlock.status,
      }));

      setIsUpdateOpen(false);
      toast.success('اطلاعات بلوک با موفقیت ویرایش شد.');
    },

    onError: () => {
      toast.error('ویرایش اطلاعات بلوک با خطا مواجه شد.');
    },
  });

  const handleUpdateModal = () => {
    setIsUpdateOpen(true);
  };

  const handleUpdateBlock = async (value: z.input<typeof UpdateBlockDto>) => {
    await updateBlockMutation.mutateAsync({
      id: detailsBlock.id,
      value,
    });

    setDetailsBlock((prevBlocks) => ({
      ...prevBlocks,
      name: value.name ?? prevBlocks.name,
      description: value.description ?? prevBlocks.description,
      status: value.status ?? prevBlocks.status,
    }));

    setIsUpdateOpen(false);
  };

  // get parcels list
  const { data } = useQuery(api.get("/parcels").queryOptions)
  const filterParcels = data?.items.filter((item: ParcelResponseDto) => {
    return item.blockId === detailsBlock.id
  })

  // handle delete parcels
    const [isDeleteOpenParcel, setIsDeleteOpenParcel] = useState(false);
    const [selectedParcel, setSelectedParcel] =useState<ParcelResponseDto | null>(null);
    const handleDeleteModalParcel = (parcel: ParcelResponseDto) => {
      setSelectedParcel(parcel);
      setIsDeleteOpenParcel(true);
    };
    const deleteParcelMutation = useMutation({
      ...api.mutation('delete', '/parcels/{id}').mutationOptions,
  
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: api.get('/parcels').queryOptions.queryKey,
        });
  
        toast.success('قطعه با موفقیت حذف شد.')
        setIsDeleteOpenParcel(false);
        setSelectedParcel(null);
      },
      onError: () => {
        toast.error('در هنگام حذف قطعه خطایی رخ داده است.')
        setIsDeleteOpenParcel(false);
        setSelectedParcel(null);
      }
    })
    
    // handle update parcels
    const [isUpdateOpenParcel, setIsUpdateOpenParcel] = useState(false);
      const handleUpdateModalParcel = (parcel: ParcelResponseDto) => {
        setSelectedParcel(parcel);
        setIsUpdateOpenParcel(true);
      }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 items-center p-4 border border-slate-200/10 rounded-xl">
      <HeadDetails
        titleHead={`جزئیات بلوک ${detailsBlock.name}`}
        unTitleHead={blockStatusMap.get(detailsBlock.status)}
        geometry={toPolygon(detailsBlock.boundary.geometry)}
        colorGeometry='--map-blue'
      />

      <div className="flex flex-col gap-4 w-full">
        <Tabs
          nameTabInfo="اطلاعات کلی بلوک"
          nameTabTable="لیست قطعه ها"
          queryKey="block"
          queryValue={detailsBlock.id}
          infoComponent={
            <div className="flex flex-col gap-3 w-1/2">
              <div className="bg-surface-raised rounded-md p-4">
                <div className="flex justify-between px-1 pb-3.5 border-b border-border">
                  <span className="text-sm">کد بلوک:</span>
                  <span className="text-sm">{detailsBlock.id}</span>
                </div>

                <div className="flex justify-between px-1 py-3.5 border-b border-border">
                  <span className="text-sm">تعداد قطعات:</span>
                  <span className="text-sm">
                    {toPersianNumber(detailsBlock.parcels.length)}
                  </span>
                </div>

                <div className="flex justify-between px-1 py-3.5 border-b border-border">
                  <span className="text-sm">منطقه:</span>
                  <span className="text-sm">{detailsBlock.region.name}</span>
                </div>

                <div className="flex justify-between px-1 pt-3.5">
                  <span className="text-sm">مساحت:</span>
                  <span className="text-sm">
                    {toPersianNumber(detailsBlock.areaM2)} مترمربع
                  </span>
                </div>
              </div>

              <div className="flex justify-between gap-2">
                <button
                  onClick={handleUpdateModal}
                  className="w-1/2 p-3 bg-action-primary text-white rounded-md cursor-pointer transition duration-300 flex justify-center items-center gap-2"
                >
                  <FiEdit2 size={14} />
                  ویرایش
                </button>

                <button
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
            <ParcelsTable
              data={filterParcels ?? []}
              onDelete={handleDeleteModalParcel}
              onEdit={handleUpdateModalParcel}
              onRowClick={(parcel) => {
                router.push(`/parcels/${encodeURIComponent(parcel.id)}`);
              }}
              searchValue={''}
            />
          }
        />
      </div>

      {/* Delete block dialog */}
      <Dialog
        open={isDeleteOpen}
        onOpenChange={console.log}
        title="حذف بلوک"
        description="آیا از حذف این بلوک اطمینان دارید؟"
        className="text-white"
      >
        <div className="flex gap-3">
          <button
            onClick={() => setIsDeleteOpen(false)}
            className="w-1/2 p-3 rounded-md bg-action-primary hover:bg-action-primary-hover transition duration-300 cursor-pointer"
          >
            انصراف
          </button>

          <button
            onClick={async () => {
              setIsDeleteOpen(false);
              await deleteBlockMutation.mutate(detailsBlock.id);
            }}
            className="w-1/2 p-3 rounded-md bg-action-error hover:bg-action-error-hover transition duration-300 cursor-pointer"
          >
            حذف بلوک
          </button>
        </div>
      </Dialog>

      {/* Update block dialog */}
      <Dialog
        open={isUpdateOpen}
        onOpenChange={console.log}
        title="ویرایش بلوک"
        description="اطلاعات بلوک را ویرایش کنید"
        className="text-white"
      >
        <UpdateBlockForm
          block={detailsBlock}
          onSubmit={handleUpdateBlock}
          onCancel={() => setIsUpdateOpen(false)}
        />
      </Dialog>

      {/* Update parcel dialog */}
      <Dialog
        open={isUpdateOpenParcel}
        onOpenChange={(open) => {
          setIsUpdateOpenParcel(open);

          if (!open) {
            setSelectedParcel(null);
          }
        }}
        title="ویرایش قطعه"
        description="اطلاعات قطعه را ویرایش کنید"
        className="text-white"
      >
        {selectedParcel && (
          <ParcelsFormUpdate
            key={selectedParcel.id}
            parcel={selectedParcel}
            onCancel={() => {
              setIsUpdateOpenParcel(false);
              setSelectedParcel(null);
            }}
          />
        )}
      </Dialog>

      {/* delete parcel dialog */}
      <Dialog
        open={isDeleteOpenParcel}
        onOpenChange={(open) => {
          setIsDeleteOpenParcel(open);

          if (!open) {
            setSelectedParcel(null);
          }
        }}
        title="حذف قطعه"
        description="آیا از حذف این قطعه اطمینان دارید؟"
        className="text-white"
      >
        {selectedParcel && (
          <div className="flex flex-col gap-5 mt-4">
            <p className="text-sm text-slate-300">
              آیا مطمئن هستید که می‌خواهید قطعه
              <span className="text-white font-semibold mx-1">
                {' '}
                {selectedParcel.name}
              </span>
              را حذف کنید؟
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteOpenParcel(false);
                  setSelectedParcel(null);
                }}
                className="w-1/2 py-2.5 rounded-lg bg-action-primary hover:bg-action-primary-hover transition duration-300 cursor-pointer"
              >
                انصراف
              </button>

              <button
                type="button"
                onClick={async () => {
                  setIsDeleteOpenParcel(false);
                  await deleteParcelMutation.mutate({
                    path: { id: selectedParcel.id },
                  });
                }}
                className="w-1/2 py-2.5 rounded-lg bg-action-error hover:bg-action-error-hover transition duration-300 cursor-pointer"
              >
                حذف قطعه
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
