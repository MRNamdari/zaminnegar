'use client';

import { useState } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import { CgSearch } from 'react-icons/cg';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/app/_lib/api.client';
import { ParcelResponseDto as Parcel } from '@zaminnegar/api-client';
import ParcelsTable from '@/app/_components/dashboard/parcels/ParcelsTable';
import { useRouter } from 'next/navigation';
import Link from 'next/dist/client/link';
import { toast } from 'react-toastify';
import { Dialog } from '@/app/_components/Dialog';
import ParcelsFormUpdate from '@/app/_components/dashboard/parcels/ParcelsFormUpdate';


export default function Page() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  // get list parcels
  const { data, error, isLoading } = useQuery(api.get('/parcels').queryOptions);

  // handle delete parcels
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const handleDeleteModal = (parcel: Parcel) => {
    setSelectedParcel(parcel);
    setIsDeleteOpen(true);
  }
  const deleteParcelMutation = useMutation({
    ...api.mutation('delete', '/parcels/{id}').mutationOptions,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: api.get('/parcels').queryOptions.queryKey,
      });

      toast.success('قطعه با موفقیت حذف شد.')
      setIsDeleteOpen(false);
      setSelectedParcel(null);
    },
    onError: () => {
      toast.error('در هنگام حذف قطعه خطایی رخ داده است.')
      setIsDeleteOpen(false);
      setSelectedParcel(null);
    }
  })
  
  // handle update parcels
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const handleUpdateModal = (parcel: Parcel) => {
      setSelectedParcel(parcel);
      setIsUpdateOpen(true);
    }
  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 items-center pb-4 pt-6 pr-4">
        <h2 className="w-full text-right text-3xl leading-loose font-normal">
          قطعه ها
        </h2>

        <div className="block-header w-full flex gap-4 justify-between items-center">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-[#504e4e52]"
          >
            <label htmlFor="simple-search" className="sr-only">
              جست و جو قطعه
            </label>

            <search className="min-w-0 w-full rounded-lg flex flex-1 border border-border bg-surface focus-within:ring-2 focus-within:ring-action-primary-hover/20">
              <input
                type="search"
                id="simple-search"
                placeholder="جست و جوی قطعه..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full py-2.5 px-3 text-sm text-foreground border-0 outline-none transition placeholder:text-foreground-muted"
              />

              <button
                type="submit"
                aria-label="جستجو"
                className="flex h-10 w-10 shrink-0 items-center justify-center text-white transition duration-300 focus:outline-none cursor-pointer"
              >
                <CgSearch className="text-action-primary text-lg" />
              </button>
            </search>
          </form>

          <Link
            href={'/map'}
            className="min-w-fit flex gap-2 items-center bg-action-primary transition duration-300 py-2.5 px-4 rounded-lg cursor-pointer"
          >
            <AiOutlinePlus className="text-white" />
            <span className="text-sm text-white">افزودن قطعه</span>
          </Link>
        </div>
        {isLoading ? (
          <p>{'در حال بارگذاری...'}</p>
        ) : error ? (
          <p>{'خطا در بارگذاری!'}</p>
        ) : (
          <ParcelsTable
            data={data?.items ?? []}
            onDelete={handleDeleteModal}
            onEdit={handleUpdateModal}
            onRowClick={(block) => {
              router.push(`/parcels/${encodeURIComponent(block.id)}`);
            }}
            searchValue={searchValue}
          />
        )}

        <Dialog
          open={isUpdateOpen}
          onOpenChange={(open) => {
            setIsUpdateOpen(open);

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
                setIsUpdateOpen(false);
                setSelectedParcel(null);
              }}
            />
          )}
        </Dialog>

        <Dialog
          open={isDeleteOpen}
          onOpenChange={(open) => {
            setIsDeleteOpen(open);

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
                    setIsDeleteOpen(false);
                    setSelectedParcel(null);
                  }}
                  className="w-1/2 py-2.5 rounded-lg bg-action-primary hover:bg-action-primary-hover transition duration-300 cursor-pointer"
                >
                  انصراف
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setIsDeleteOpen(false);
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
    </div>
  );
}
