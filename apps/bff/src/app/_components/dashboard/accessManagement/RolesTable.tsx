import type { RoleResponseDto as Role } from '@zaminnegar/api-client';
import { useTable, type ColumnDef } from '@tanstack/react-table';import { useMemo } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import {
  Table,
  BASIC_TABLE_FEATURES,
  BasicTableFeatures,
} from '../table/Table';
// import { toast } from 'react-toastify';
// import { toPersianNumber } from '@/app/util';
// import z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/app/_lib/api.client';

interface RolesTableProps {
  searchValue: string;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  pageSize?: number;
}

export default function RolesTable({
  searchValue,
  onEdit,
  onDelete,
}: RolesTableProps) {
  const columns = useMemo<ColumnDef<BasicTableFeatures, Role>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'نام نقش',
        sortingFn: 'alphanumeric',
        filterFn: 'includesString',
        cell({ row }) {
          return (
            <span
              className="w-full inline-block h-full text-foreground"
            >
              {row.original.name}
            </span>
          );
        },
      },
      {
        accessorKey: 'description',
        header: 'توضیحات',
        enableSorting: false,
        cell({ row }) {
          return (
            <span className="block text-[12px] max-w-32 text-wrap">
              {row.original.description || '-'}
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
              aria-label={`Edit ${row.original.id}`}
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
              aria-label={`Delete ${row.original.id}`}
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
      searchValue.trim() ? [{ id: 'code', value: searchValue.trim() }] : [],
    [searchValue],
  );

  // get Roles
  const { data, isLoading } = useQuery(api.get('/roles/system').queryOptions);

  const table = useTable({
    features: BASIC_TABLE_FEATURES,
    data: data ?? [],
    columns,
    state: {
      columnFilters,
    },

    getRowId: (row) => row.id,
  });

  return (
    <Table
      table={table}
      onPageChange={() => {}}
      pagination={{ page: 1, limit: 20, total: 10 }}
      isLoading={isLoading}
    />
  );
}
