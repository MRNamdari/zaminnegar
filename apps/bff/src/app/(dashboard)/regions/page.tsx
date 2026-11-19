'use client';

import {
  RegionResponseDto as Region,
  UpdateRegionDto,
} from '@zaminnegar/api-client';
import { useState } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import { CgSearch } from 'react-icons/cg';

import RegionsTable from '@/app/_components/dashboard/regions/RegionsTable';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/app/_lib/api.client';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { Dialog } from '@/app/_components/Dialog';
import { toPersianNumber } from '@/app/util';
import z from 'zod';
import RegionFormUpdate from '@/app/_components/dashboard/regions/RegionFormUpdate';

export default function RegionsPage() {
  const [searchValue, setSearchValue] = useState('');

  // get liset region
  const { data, error, isLoading } = useQuery(api.get('/regions').queryOptions);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const queryClient = useQueryClient();

  // handle delete region
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const handleDeleteModal = (region: Region) => {
    setSelectedRegion(region);
    setIsDeleteOpen(true);
  };
  const deleteRegionMutation = useMutation({
    ...api.mutation('delete', '/regions/{id}').mutationOptions,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: api.get('/regions').queryOptions.queryKey,
      });

      toast.success('منطقه با موفقیت حذف شد.');
      setIsDeleteOpen(false);
      setSelectedRegion(null);
    },

    onError(error, variable) {
      const toDeleteId = variable.path.id;
      const toDeleteRegion = data?.items.find((r) => r.id === toDeleteId);
      if (!toDeleteRegion) return;
      if (toDeleteRegion.blocksCount ?? 0 > 0) {
        toast.error(
          `منطقه دارای ${toPersianNumber(toDeleteRegion.blocksCount ?? 0)} بلوک است و قابل حذف نمیباشد.`,
        );
      }
      if (
        (toDeleteRegion.blocksCount ?? 0) < 1 &&
        (toDeleteRegion.parcelsCount ?? 0) > 0
      ) {
        toast.error(
          `منطقه دارای ${toPersianNumber(toDeleteRegion.parcelsCount ?? 0)} قطعه است و قابل حذف نمیباشد.`,
        );
      }
    },
  });

  // handle update region
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const handleUpdateModal = (region: Region) => {
    setIsUpdateOpen(true);
    setSelectedRegion(region);
  };

  const updateRegionMutation = useMutation({
    mutationFn: ({
      id,
      value,
    }: {
      id: string;
      value: z.input<typeof UpdateRegionDto>;
    }) =>
      api.client.patch('/regions/{id}', {
        path: { id },
        body: value,
      }),

    onSuccess: async (_, variables) => {
      queryClient.setQueryData(
        api.get('/regions').queryOptions.queryKey,
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            items: oldData.items.map((region) =>
              region.id === variables.id
                ? {
                    ...region,
                    name: variables.value.name ?? region.name,
                    description:
                      variables.value.description ?? region.description,
                  }
                : region,
            ),
          };
        },
      );

      await queryClient.invalidateQueries({
        queryKey: api.get('/regions').queryOptions.queryKey,
      });

      setIsUpdateOpen(false);
      setSelectedRegion(null);

      toast.success('اطلاعات منطقه با موفقیت ویرایش شد.');
    },

    onError: () => {
      toast.error('ویرایش اطلاعات قطعه با خطا مواجه شد.');
    },
  });

  const handleUpdateRegion = async (value: z.input<typeof UpdateRegionDto>) => {
    if (!selectedRegion) return;

    await updateRegionMutation.mutateAsync({
      id: selectedRegion.id,
      value,
    });
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 items-center pb-4 pt-6 pr-4">
        <h2 className="w-full text-right text-3xl leading-loose font-normal">
          منطقه ها
        </h2>
        <div className="block-header w-full flex gap-4 justify-between items-center">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-[#504e4e52]"
          >
            <label htmlFor="simple-search" className="sr-only">
              جست و جو منطقه
            </label>

            <search className="min-w-0 w-full rounded-lg flex flex-1 border border-border bg-surface focus-within:ring-2 focus-within:ring-action-primary-hover/20">
              <input
                type="search"
                id="simple-search"
                placeholder="جست و جوی منطقه..."
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
            <span className="text-sm text-white">افزودن منطقه</span>
          </Link>
        </div>
        {/* Regions Table */}
        {isLoading ? (
          <p>{'در حال بارگذاری...'}</p>
        ) : error ? (
          <p>{'خطا در بارگذاری!'}</p>
        ) : (
          <RegionsTable
            data={data?.items ?? []}
            onDelete={handleDeleteModal}
            onEdit={handleUpdateModal}
            onRowClick={console.log}
            searchValue={searchValue}
          />
        )}

        {/* Update Region Dialog */}
        <Dialog
          open={isUpdateOpen}
          onOpenChange={(open) => {
            setIsUpdateOpen(open);
            if (!open) {
              setSelectedRegion(null);
            }
          }}
          title="ویرایش منطقه"
          description="اطلاعات منطقه را ویرایش کنید"
          className="text-white"
        >
          {selectedRegion && (
            <RegionFormUpdate
              region={selectedRegion}
              onSubmit={handleUpdateRegion}
              onCancel={() => {
                setIsUpdateOpen(false);
                setSelectedRegion(null);
              }}
            />
          )}
        </Dialog>

        {/* Delete Region Dialog */}
        <Dialog
          open={isDeleteOpen}
          onOpenChange={(open) => {
            setIsDeleteOpen(open);

            if (!open) {
              setSelectedRegion(null);
            }
          }}
          title="حذف منطقه"
          description="آیا از حذف این منطقه اطمینان دارید؟"
          className="text-white"
        >
          {selectedRegion && (
            <div className="flex flex-col gap-5 mt-4">
              <p className="text-sm text-slate-300">
                آیا مطمئن هستید که می‌خواهید منطقه
                <span className="text-white font-semibold mx-1">
                  {' '}
                  {selectedRegion.name}
                </span>
                را حذف کنید؟
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteOpen(false);
                    setSelectedRegion(null);
                  }}
                  className="w-1/2 py-2.5 rounded-lg bg-action-primary hover:bg-action-primary-hover transition duration-300 cursor-pointer"
                >
                  انصراف
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setIsDeleteOpen(false);
                    await deleteRegionMutation.mutate({
                      path: { id: selectedRegion.id },
                    });
                  }}
                  className="w-1/2 py-2.5 rounded-lg bg-action-error hover:bg-action-error-hover transition duration-300 cursor-pointer"
                >
                  حذف منطقه
                </button>
              </div>
            </div>
          )}
        </Dialog>
      </div>
    </div>
  );
}
