"use client";

import { useMemo } from "react";

import {
  useTable,
  tableFeatures,
  rowSortingFeature,
  columnFilteringFeature,
  rowPaginationFeature,
  createSortedRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  filterFn_includesString,
  columnVisibilityFeature,
  sortFns,
  type ColumnDef,
} from "@tanstack/react-table";

import {
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";

import { toPersianNumber } from "@/app/util";

export enum OwnerStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  FINAL = "FINAL",
}

export const OwnerStatusMap: Record<OwnerStatus, string> = {
  [OwnerStatus.ACTIVE]: "فعال",
  [OwnerStatus.INACTIVE]: "غیر فعال",
  [OwnerStatus.FINAL]: ""
};

export interface Owner {
  code?: string;
  id: string;
  name: string;
  parcelCount: number;
  totalArea: number;
  status: OwnerStatus;
}

interface OwnersTableProps {
  data: Owner[];
  searchValue: string;
  onRowClick: (owner: Owner) => void;
  onEdit: (owner: Owner) => void;
  onDelete: (owner: Owner) => void;
  pageSize?: number;
}

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns,
  columnVisibilityFeature,
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: {
    includesString: filterFn_includesString,
  },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

const statusStyles: Record<OwnerStatus, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-red-200 text-red-700",
  [OwnerStatus.FINAL]: ""
};

export default function OwnersTable({
  data,
  searchValue,
  onRowClick,
  onEdit,
  onDelete,
  pageSize = 10,
}: OwnersTableProps) {

  const columns = useMemo<ColumnDef<typeof features, Owner>[]>(
    () => [
      {
        accessorKey: "name",
        header: "نام مالک",
        sortingFn: "alphanumeric",
        filterFn: "includesString",
      },
      {
        accessorKey: "parcelCount",
        header: "تعداد قطعات",
        sortingFn: "basic",
        cell({ row }) {
          return toPersianNumber(row.original.parcelCount);
        },
      },
      {
        accessorKey: "totalArea",
        header: "مساحت کل",
        sortingFn: "basic",
        cell({ row }) {
          return `${toPersianNumber(row.original.totalArea)} هکتار`;
        },
      },
      {
        accessorKey: "status",
        header: "وضعیت",
        cell: ({ row }) => {
          const status = row.original.status;

          return (
            <span
              className={`min-w-18 text-center rounded-full px-3 pt-1 pb-0.5 text-xs font-medium ${statusStyles[status]}`}
            >
              {OwnerStatusMap[status]}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
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
              className="rounded p-2 text-blue-600 hover:bg-blue-900 transition duration-300 cursor-pointer"
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
              className="rounded p-2 text-red-600 hover:bg-red-900 transition duration-300 cursor-pointer"
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
      searchValue.trim() ? [{ id: "name", value: searchValue.trim() }] : [],
    [searchValue],
  );


  const table = useTable({
    features,
    data,
    columns,
    state: {
      columnFilters,
    },
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize,
      },
    },
    getRowId: (row) => row.id,
  });

  const rows = table.getRowModel().rows;
  const pageCount = table.getPageCount();

  return (
    <div className="w-full space-y-4">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-200/10">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className="px-4 py-3 font-light"
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        disabled={!header.column.getCanSort()}
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center gap-2 disabled:cursor-default"
                      >
                        <table.FlexRender header={header} />

                        {header.column.getCanSort() &&
                          (header.column.getIsSorted() === "asc" ? (
                            <FiArrowUp />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <FiArrowDown />
                          ) : null)}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  مالکی یافت نشد
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick(row.original)}
                  onKeyDown={(event) => {
                    if (
                      event.target === event.currentTarget &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      onRowClick(row.original);
                    }
                  }}
                  tabIndex={0}
                  aria-label={`Open owner ${row.original.name}`}
                  className="even:bg-surface transition hover:bg-surface-muted border-t border-border focus-visible:outline-2 cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-right">
                      <table.FlexRender cell={cell} />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-gray-500">
          {toPersianNumber(table.getFilteredRowModel().rows.length)} مالک
        </span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Previous page"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded bg-blue-500 hover:bg-blue-600 p-2 disabled:opacity-40 cursor-pointer transition duration-300"
          >
            <FiChevronRight />
          </button>

          <span className="text-sm">
            صفحه {toPersianNumber(table.state.pagination.pageIndex + 1)} از{" "}
            {toPersianNumber(Math.max(1, pageCount))}
          </span>

          <button
            type="button"
            aria-label="Next page"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded bg-blue-500 hover:bg-blue-600 p-2 disabled:opacity-40 cursor-pointer transition duration-300"
          >
            <FiChevronLeft />
          </button>
        </div>
      </div>
    </div>
  );
}
