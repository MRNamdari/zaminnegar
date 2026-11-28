import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createSortedRowModel,
  filterFn_includesString,
  rowSortingFeature,
  tableFeatures,
  type ReactTable,
  type RowData,
} from '@tanstack/react-table';

import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { Paginator } from './Paginator';

export const BASIC_TABLE_FEATURES = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),

  columnVisibilityFeature,

  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: {
    includesString: filterFn_includesString,
  },
});

export type BasicTableFeatures = typeof BASIC_TABLE_FEATURES;

export type TablePagination = {
  total: number;
  page: number;
  limit: number;
};

type TableProps<TData extends RowData> = {
  table: ReactTable<typeof BASIC_TABLE_FEATURES, TData>;
  pagination?: TablePagination;
  onPageChange?: (page: number) => void;
  onRowClick?: (data: TData) => void;
  getRowHref?: (data: TData) => string;
  isLoading?: boolean;
};

function TableSkeleton({
  columns,
  rows = 5,
}: {
  columns: number;
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="even:bg-surface border-t border-border">
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <td key={columnIndex} className="px-4 py-3">
              <div className="h-4 w-full max-w-40 rounded bg-surface-muted animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function Table<TData extends RowData>({
  table,
  pagination,
  onPageChange,
  onRowClick,
  getRowHref,
  isLoading = false,
}: TableProps<TData>) {
  const rows = table.getRowModel().rows;
  const columns = table.getVisibleLeafColumns();

  return (
    <div className="w-full space-y-4">
      <div className="overflow-x-auto rounded-xl bg-background p-4">
        <table dir="rtl" className="w-full text-left font-normal">
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className="p-4 font-normal bg-surface first:rounded-r-xl last:rounded-l-xl"
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        disabled={!header.column.getCanSort() || isLoading}
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center gap-2 disabled:cursor-default"
                      >
                        <table.FlexRender header={header} />

                        {header.column.getIsSorted() === 'asc' ? (
                          <FiArrowUp />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <FiArrowDown />
                        ) : null}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
            <tr className="h-2.5"></tr>
          </thead>

          <tbody aria-busy={isLoading}>
            {isLoading ? (
              <TableSkeleton columns={Math.max(1, columns.length)} />
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={Math.max(1, columns.length)}
                  className="px-4 py-10 text-center text-text"
                >
                  موردی یافت نشد
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={
                    onRowClick ? () => onRowClick(row.original) : undefined
                  }
                  className={[
                    'even:bg-surface/70 transition duration-300 not-last:border-b border-border',
                    onRowClick ? 'cursor-pointer hover:bg-surface/70' : '',
                  ].join(' ')}
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

      {pagination && onPageChange && (
        <Paginator {...pagination} onPageChange={onPageChange} />
      )}
    </div>
  );
}
