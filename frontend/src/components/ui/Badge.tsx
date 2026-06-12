import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
interface BadgeProps { variant?: BadgeVariant; children: React.ReactNode; className?: string; dot?: boolean; }

export function Badge({ variant = 'default', children, className, dot = false }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    danger: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    neutral: 'bg-neutral-50 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  };
  const dotColors: Record<BadgeVariant, string> = {
    default: 'bg-neutral-400', success: 'bg-emerald-500', warning: 'bg-amber-500',
    danger: 'bg-red-500', info: 'bg-blue-500', neutral: 'bg-neutral-400',
  };
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium', variants[variant], className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
}
