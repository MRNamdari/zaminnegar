'use client';

import { useMemo, useState } from 'react';
import { useTable, type ColumnDef } from '@tanstack/react-table';
import { BASIC_TABLE_FEATURES, type BasicTableFeatures } from '../table/Table';
import type { OwnerResponseDto as Owner } from '@zaminnegar/api-client';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

import { toPersianNumber } from '@/app/util';
import Link from 'next/link';
import { Table } from '../table/Table';
import { api } from '@/app/_lib/api.client';
import { useQuery } from '@tanstack/react-query';

interface OwnersTableProps {
  searchValue: string;
  onRowClick: (owner: Owner) => void;
  onEdit: (owner: Owner) => void;
  onDelete: (owner: Owner) => void;
}

export default function OwnersTable({
  searchValue,
  onRowClick,
  onEdit,
  onDelete,
}: OwnersTableProps) {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isPending, isLoading } = useQuery({
    ...api.get('/owners', { query: { page, limit, search: searchValue } })
      .queryOptions,
  });

  const columns = useMemo<ColumnDef<BasicTableFeatures, Owner>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'نام مالک',
        sortingFn: 'alphanumeric',
        cell({ row }) {
          return (
            <Link
              className="w-full inline-block h-full text-blue-400 hover:underline underline-offset-4"
              href={{ pathname: `/owners/${row.original.id}` }}
            >
              {row.original.name}
            </Link>
          );
        },
      },
      {
        accessorKey: 'parcelCount',
        header: 'تعداد قطعات',
        sortingFn: 'basic',
        cell({ row }) {
          return toPersianNumber(row.original.parcelsCount ?? 0);
        },
      },
      {
        accessorKey: 'totalArea',
        header: 'مساحت کل',
        sortingFn: 'basic',
        cell({ row }) {
          return `${toPersianNumber(row.original.totalArea ?? 0)} مترمربع`;
        },
      },
      {
        accessorKey: 'status',
        header: 'وضعیت',
        cell: ({ row }) => {
          const status = row.original.status;

          return (
            <span
              className={`min-w-18 text-center select-none rounded-full px-3 pt-1 pb-0.5 text-xs font-medium ${status === 'active' ? 'bg-map-green text-surface' : 'bg-surface-muted text-foreground'}`}
            >
              {status}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={`Edit ${row.original.name}`}
              onClick={(event) => {
                event.stopPropagation();
                onEdit(row.original);
              }}
              className="isolate cursor-pointer rounded-full p-4 hover:text-blue-600 hover:bg-surface-raised transition duration-300"
            >
              <FiEdit2 size={17} />
            </button>

            <button
              type="button"
              aria-label={`Delete ${row.original.name}`}
              onClick={(event) => {
                event.stopPropagation();
                onDelete(row.original);
              }}
              className="isolate cursor-pointer rounded-full p-4 hover:text-red-600 hover:bg-surface-raised transition duration-300"
            >
              <FiTrash2 size={17} />
            </button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete],
  );

  const columnFilters = useMemo(
    () =>
      searchValue.trim() ? [{ id: 'name', value: searchValue.trim() }] : [],
    [searchValue],
  );

  const table = useTable({
    features: BASIC_TABLE_FEATURES,
    data: data?.items ?? [],
    columns,
    state: {
      columnFilters,
    },
    getRowId: (row) => row.id,
  });
  return (
    <Table
      table={table}
      onRowClick={onRowClick}
      onPageChange={setPage}
      pagination={{ page, limit, total: data?.total ?? 0 }}
      isLoading={isPending || isLoading}
    />
  );
}
