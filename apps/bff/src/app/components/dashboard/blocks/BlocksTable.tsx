"use client";

export interface Block {
  id: string;
  code: string;
  region: "شمال" | "جنوب" | "شرق" | "غرب" | "مرکز";
  parcelCount: number;
  status: "پیشنهادیه" | "پیش‌نویس" | "نهایی";
}

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
import Link from "next/link";

interface BlocksTableProps {
  data: Block[];
  searchValue: string;
  onRowClick: (block: Block) => void;
  onEdit: (block: Block) => void;
  onDelete: (block: Block) => void;
  pageSize?: number;
}

// TanStack Table v9 features
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


export default function BlocksTable({
  data,
  searchValue,
  onRowClick,
  onEdit,
  onDelete,
  pageSize = 10,
}: BlocksTableProps) {
  const columns = useMemo<ColumnDef<typeof features, Block>[]>(
    () => [
      {
        accessorKey: "code",
        header: "کد بلوک",
        sortingFn: "alphanumeric",
        filterFn: "includesString",
        cell({ row }) {
          return (
            <Link
              className="w-full inline-block h-full text-blue-400 hover:underline underline-offset-4"
              href={{ pathname: "/blocks/" + row.original.id }}
            >
              {row.original.code}
            </Link>
          );
        },
      },
      {
        accessorKey: "region",
        header: "منطقه",
      },
      {
        accessorKey: "parcelCount",
        header: "قطعه",
        sortingFn: "basic",
        cell({ row }) {
          const parcelCount = row.original.parcelCount;
          return toPersianNumber(parcelCount);
        },
      },
      {
        accessorKey: "status",
        header: "وضعیت",
        cell: ({ row }) => {
          const status = row.original.status;

          return (
            <span
              className={`min-w-18 text-center rounded-full px-3 pt-1 pb-0.5 text-xs font-medium ${
                status === "نهایی"
                  ? "bg-map-green text-surface"
                  : status === "پیشنهادیه"
                    ? "bg-action-warning/90 text-surface"
                    : "bg-surface-muted text-foreground"
              }`}
            >
              {status}
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
              aria-label={`Edit ${row.original.code}`}
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
              aria-label={`Delete ${row.original.code}`}
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
      searchValue.trim() ? [{ id: "code", value: searchValue.trim() }] : [],
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
    getRowId: (row) => row.code,
  });

  const rows = table.getRowModel().rows;
  const pageCount = table.getPageCount();

  return (
    <div className="w-full space-y-4">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-raised">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className="px-4 py-3 font-semibold"
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
                  className="px-4 py-10 text-center text-gray-300"
                >
                  بلوکی یافت نشد
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  tabIndex={0}
                  aria-label={`Open block ${row.original.code}`}
                  className="even:bg-surface transition hover:bg-surface-muted border-t border-border focus-visible:outline-2 "
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
          {toPersianNumber(table.getFilteredRowModel().rows.length)} بلوک
        </span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Previous page"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-full transition-colors ease-in-out bg-action-primary hover:bg-action-primary-hover disabled:bg-surface-muted p-2 cursor-pointer disabled:cursor-not-allowed"
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
            className="rounded-full transition-colors ease-in-out bg-action-primary hover:bg-action-primary-hover disabled:bg-surface-muted p-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <FiChevronLeft />
          </button>
        </div>
      </div>
    </div>
  );
}
