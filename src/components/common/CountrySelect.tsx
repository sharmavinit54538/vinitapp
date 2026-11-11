'use client';

import React from 'react';
import { Globe } from 'lucide-react';

export interface CountryOption {
  code: string;
  name: string;
  dialCode: string;
  currency: string;
}

export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: 'IN', name: 'India', dialCode: '+91', currency: 'INR' },
  { code: 'US', name: 'United States', dialCode: '+1', currency: 'USD' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', currency: 'GBP' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', currency: 'AED' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', currency: 'SGD' },
  { code: 'AU', name: 'Australia', dialCode: '+61', currency: 'AUD' },
  { code: 'CA', name: 'Canada', dialCode: '+1', currency: 'CAD' },
  { code: 'DE', name: 'Germany', dialCode: '+49', currency: 'EUR' },
];

export interface CountrySelectProps {
  id?: string;
  value: string;
  onChange: (countryName: string, option?: CountryOption) => void;
  error?: string;
  disabled?: boolean;
}

export function CountrySelect({
  id = 'onboarding-country-select',
  value,
  onChange,
  error,
  disabled = false,
}: CountrySelectProps) {
  return (
    <div>
      <div className="relative">
        <Globe className="pointer-events-none absolute top-3 left-3 h-4 w-4 text-slate-400" />
        <select
          id={id}
          aria-label="Country"
          value={value}
          disabled={disabled}
          onChange={(e) => {
            const val = e.target.value;
            const found = COUNTRY_OPTIONS.find(
              (c) => c.name === val || c.code === val
            );
            onChange(val, found);
          }}
          className={`h-10 w-full rounded-xl border bg-white pr-3 pl-9 text-xs font-medium text-slate-900 focus:ring-2 focus:outline-none ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/15'
              : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/15'
          }`}
        >
          <option value="">Select Country...</option>
          {COUNTRY_OPTIONS.map((c) => (
            <option key={c.code} value={c.name}>
              {c.name} ({c.code} · {c.dialCode})
            </option>
          ))}
        </select>
      </div>
      {error ? (
        <p className="mt-1 text-[11px] font-medium text-rose-600">{error}</p>
      ) : null}
    </div>
  );
}
