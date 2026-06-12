import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps { page: number; total: number; limit: number; onChange: (page: number) => void; }

export function Pagination({ page, total, limit, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  return (
    <div className="flex items-center justify-between px-1">
      <p className="text-xs text-neutral-500 dark:text-neutral-400">Showing {start}–{end} of {total}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1} className={cn('p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed')}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs text-neutral-600 dark:text-neutral-400 px-2">{page} / {totalPages}</span>
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages} className={cn('p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed')}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
