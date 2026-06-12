import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectOption { value: string; label: string; }
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string; error?: string; hint?: string;
  options: SelectOption[]; placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label htmlFor={inputId} className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</label>}
        <div className="relative">
          <select
            ref={ref} id={inputId}
            className={cn(
              'w-full h-9 rounded-md border bg-white px-3 py-2 pr-8 text-sm text-neutral-900 appearance-none',
              'border-neutral-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none',
              'dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100',
              'disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150',
              error && 'border-red-500', className
            )}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
