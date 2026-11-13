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

import type { Projects } from "@/app/features/projects/interface";
import { faNum } from "@/app/util";
import Link from "next/link";

export type Project = Projects;

interface ProjectTableProps {
  data: Project[];
  searchValue: string;
  onRowClick: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  pageSize?: number;
}

// TanStack Table features

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

export default function ProjectsTable({
  data,
  searchValue,
  onRowClick,
  onEdit,
  onDelete,
  pageSize = 10,
}: ProjectTableProps) {
  const columns = useMemo<ColumnDef<typeof features, Project>[]>(
    () => [
      {
        accessorKey: "name",
        header: "نام پروژه",
        sortingFn: "alphanumeric",
        filterFn: "includesString",
        cell({ row }) {
          return (
            <Link
              className="w-full inline-block h-full text-blue-400 hover:underline underline-offset-4"
              href={{
                pathname: `/map`,
              }}
              onClick={(event) => event.stopPropagation()}
            >
              {row.original.name}
            </Link>
          );
        },
      },
      {
        accessorKey: "description",
        header: "توضیحات",
        enableSorting: false,
        cell({ row }) {
          return (
            <span className="block text-[12px] max-w-32 text-wrap">
              {row.original.description || "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "regions",
        header: "مناطق",
        cell({ row }) {
          return row.original.regions != null
            ? faNum(row.original.regions)
            : "-";
        },
      },
      {
        accessorKey: "blocks",
        header: "بلوک ها",
        cell({ row }) {
          return row.original.blocks != null
            ? faNum(row.original.blocks)
            : "-";
        },
      },
      {
        accessorKey: "parcels",
        header: "قطعات",
        cell({ row }) {
          return row.original.parcels != null
            ? faNum(row.original.parcels)
            : "-";
        },
      },
      {
        accessorKey: "owners",
        header: "مالکین",
        cell({ row }) {
          return row.original.owners != null
            ? faNum(row.original.owners)
            : "-";
        },
      },
      {
        accessorKey: "status",
        header: "وضعیت",
        cell: ({ row }) => {
          const status = row.original.status;

          const statusStyles = {
            فعال: "bg-map-green text-surface",
            "غیر فعال": "bg-surface-muted text-foreground",
            "در انتظار": "bg-yellow-500/20 text-yellow-400",
          };

          return (
            <span
              className={`min-w-20 text-center inline-block select-none rounded-full px-3 pt-1 pb-0.5 text-xs font-medium ${statusStyles[status]}`}
            >
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "تاریخ ایجاد",
        cell({ row }) {
          return new Intl.DateTimeFormat("fa-IR").format(
            new Date(row.original.createdAt),
          );
        },
      },
      {
        id: "actions",
        header: "عملیات",
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
      searchValue.trim()
        ? [{ id: "name", value: searchValue.trim() }]
        : [],
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
                    className="px-4 min-w-20 py-3 font-semibold"
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
                  پروژه ای یافت نشد
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
                  aria-label={`Open project ${row.original.name}`}
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
          {faNum(table.getFilteredRowModel().rows.length)} پروژه
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
            صفحه {faNum(table.state.pagination.pageIndex + 1)} از{" "}
            {faNum(Math.max(1, pageCount))}
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