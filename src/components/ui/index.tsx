'use client';

import React from 'react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary:
      'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs disabled:opacity-50',
    secondary:
      'bg-slate-900 text-white hover:bg-slate-800 shadow-xs disabled:opacity-50',
    outline:
      'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50',
    ghost: 'text-slate-600 hover:bg-slate-100 disabled:opacity-50',
  };

  const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'h-8 px-3 text-xs rounded-xl',
    md: 'h-10 px-4 text-xs rounded-xl',
    lg: 'h-11 px-5 text-sm rounded-xl',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all cursor-pointer disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function Input({ error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      <input
        className={`h-10 w-full rounded-xl border bg-white px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:outline-none ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/15'
            : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/15'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-[11px] font-medium text-rose-600">{error}</p>
      ) : null}
    </div>
  );
}

export function Label({
  children,
  htmlFor,
  required,
  className = '',
}: {
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`mb-1.5 block text-xs font-semibold text-slate-700 ${className}`}
    >
      {children}
      {required ? <span className="ml-0.5 text-rose-600">*</span> : null}
    </label>
  );
}

export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-xs ${className}`}
    >
      {children}
    </div>
  );
}

export function Switch({
  id,
  checked,
  onCheckedChange,
  label,
  description,
}: {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
      <div>
        {label ? (
          <p className="text-xs font-semibold text-slate-900">{label}</p>
        ) : null}
        {description ? (
          <p className="text-[11px] text-slate-500">{description}</p>
        ) : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label || 'Toggle switch'}
        onClick={() => onCheckedChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
          checked ? 'bg-indigo-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
