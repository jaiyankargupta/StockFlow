import React from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label htmlFor={inputId} className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</label>}
        <textarea
          ref={ref} id={inputId} rows={3}
          className={cn(
            'w-full rounded-md border bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400',
            'border-neutral-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none',
            'dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder:text-neutral-500',
            'disabled:opacity-50 disabled:cursor-not-allowed resize-none transition-colors duration-150',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500', className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
