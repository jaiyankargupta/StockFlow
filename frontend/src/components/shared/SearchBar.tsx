import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps { value: string; onChange: (value: string) => void; placeholder?: string; className?: string; }

export function SearchBar({ value, onChange, placeholder = 'Search…', className }: SearchBarProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
      <input
        type="search" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full h-9 pl-9 pr-8 rounded-md border border-neutral-300 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder:text-neutral-500 transition-colors"
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
