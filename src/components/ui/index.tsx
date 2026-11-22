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
      'bg-[#0A66C2] text-white hover:bg-[#004182] disabled:opacity-50',
    secondary:
      'bg-[#171717] text-white hover:bg-[#333333] disabled:opacity-50',
    outline:
      'border border-[#E5E7EB] bg-white text-[#171717] hover:bg-[#F3F2EF] disabled:opacity-50',
    ghost: 'text-[#404040] hover:bg-[#F3F2EF] disabled:opacity-50',
  };

  const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'h-9 px-3 text-xs rounded-md',
    md: 'h-10 px-4 text-sm rounded-md',
    lg: 'h-11 px-5 text-sm rounded-lg',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#0A66C2] ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
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
        className={`h-10 w-full rounded-md border bg-white px-3 text-sm text-[#171717] placeholder:text-[#666666] focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-300 focus:border-red-600 focus:ring-red-600/15'
            : 'border-[#E5E7EB] focus:border-[#0A66C2] focus:ring-[#0A66C2]/15'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs font-medium text-[#B91C1C]">{error}</p>
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
      className={`mb-1.5 block text-xs font-semibold text-[#171717] ${className}`}
    >
      {children}
      {required ? <span className="ml-0.5 text-[#B91C1C]">*</span> : null}
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
      className={`rounded-lg border border-[#E5E7EB] bg-white p-4 ${className}`}
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
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[#E5E7EB] bg-white p-3">
      <div>
        {label ? (
          <p className="text-sm font-medium text-[#171717]">{label}</p>
        ) : null}
        {description ? (
          <p className="text-xs text-[#666666]">{description}</p>
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
          checked ? 'bg-[#0A66C2]' : 'bg-[#D1D5DB]'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white transition ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
