import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-2xs placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150 hover:border-slate-300 dark:hover:border-slate-700 focus-visible:outline-none focus-visible:border-indigo-600 dark:focus-visible:border-indigo-500 focus-visible:ring-3 focus-visible:ring-indigo-500/15 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
