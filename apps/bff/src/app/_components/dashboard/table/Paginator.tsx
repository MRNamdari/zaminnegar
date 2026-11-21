import { toPersianNumber } from '@/app/util';
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';

type PaginatorProps = {
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
};

export function Paginator({
  total,
  page,
  limit,
  onPageChange,
}: PaginatorProps) {
  const pageCount = Math.ceil(total / limit);

  const hasPreviousPage = page > 1;
  const hasNextPage = page < pageCount;

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-500">
        {toPersianNumber(total)} مالک
      </span>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Previous page"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPreviousPage}
          className="rounded-full transition-colors ease-in-out bg-action-primary hover:bg-action-primary-hover disabled:bg-surface-muted p-2 cursor-pointer disabled:cursor-not-allowed"
        >
          <FiChevronRight />
        </button>

        <span className="text-sm select-none">
          صفحه {toPersianNumber(page)} از{' '}
          {toPersianNumber(Math.max(1, pageCount))}
        </span>

        <button
          type="button"
          aria-label="Next page"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="rounded-full transition-colors ease-in-out bg-action-primary hover:bg-action-primary-hover disabled:bg-surface-muted p-2 cursor-pointer disabled:cursor-not-allowed"
        >
          <FiChevronLeft />
        </button>
      </div>
    </div>
  );
}
