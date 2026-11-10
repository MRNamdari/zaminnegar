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
import type { IParcel } from "@/app/features/parcels/interface";
import { toPersianNumber } from "@/app/util";
import { SvgPolygon } from "../SvgMultiPolygon";
import Link from "next/link";

export type Parcel = IParcel;

interface ParcelTableProps {
  data: Parcel[];
  searchValue: string;
  onRowClick: (parcel: Parcel) => void;
  onEdit: (parcel: Parcel) => void;
  onDelete: (parcel: Parcel) => void;
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

export default function ParcelsTable({
  data,
  searchValue,
  onRowClick,
  onEdit,
  onDelete,
  pageSize = 10,
}: ParcelTableProps) {
  const columns = useMemo<ColumnDef<typeof features, Parcel>[]>(
    () => [
      {
        accessorKey: "id",
        header: "نام قطعه",
        cell({ row }) {
          return (
            <SvgPolygon height="3rem" multiPolygon={row.original.geometry} />
          );
        },
      },
      {
        accessorKey: 'name',
        header: '',
        sortingFn: 'alphanumeric',
        filterFn: 'includesString',
        cell({ row }) {
          return (
            <Link
              className="w-full inline-block h-full text-blue-400 hover:underline underline-offset-4"
              href={`/parcels/${row.original.id}`}
              onClick={(event) => event.stopPropagation()}
            >
              {row.original.name}
            </Link>
          );
        },
      },
      {
        accessorKey: "areaM2",
        header: "مساحت",
        cell({ row }) {
          const area = Number(row.original.areaM2) || 0;

          return (
            <div>
              <div>
                {toPersianNumber(
                  Math.floor(parseFloat(row.original.areaM2) / 10_000),
                )}{" "}
                <span>هکتار</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "block",
        header: "بلوک ها",
        cell({ row }) {
          return row.original.block ?? "-";
        },
      },
      {
        accessorKey: "owners",
        header: "مالکین",
        sortingFn: "basic",
        cell({ row }) {
          const owners = row.original.owners ?? [];

          if (owners.length === 0) {
            return '-';
          }

          return (
            <div className="flex flex-wrap gap-2">
              {owners.map((parcelOwner) => {
                const owner = parcelOwner.owner;

                if (!owner) return null;

                return (
                  <Link
                    key={owner.id}
                    className="text-blue-400 hover:underline underline-offset-4"
                    href={`/owners/${owner.id}`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {owner.name}
                  </Link>
                );
              })}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "وضعیت",
        cell: ({ row }) => {
          const status = row.original.status;

          return (
            <span
              className={`min-w-18 text-center select-none rounded-full px-3 pt-1 pb-0.5 text-xs font-medium ${status === "فعال" ? "bg-map-green text-surface" : "bg-surface-muted text-foreground"}`}
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
    getRowId: (row) => row.id,
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
                          (header.column.getIsSorted() === 'asc' ? (
                            <FiArrowUp />
                          ) : header.column.getIsSorted() === 'desc' ? (
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
                  قطعه‌ای یافت نشد
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
                      (event.key === 'Enter' || event.key === ' ')
                    ) {
                      event.preventDefault();
                      onRowClick(row.original);
                    }
                  }}
                  tabIndex={0}
                  aria-label={`Open parcel ${row.original.name}`}
                  className="even:bg-surface transition hover:bg-surface-muted border-t border-border focus-visible:outline-2"
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
          {toPersianNumber(table.getFilteredRowModel().rows.length)} قطعه
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

          <span className="text-sm select-none">
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
