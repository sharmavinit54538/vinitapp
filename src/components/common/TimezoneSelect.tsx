'use client';

import React from 'react';
import { Clock } from 'lucide-react';

export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  {
    value: 'Asia/Kolkata',
    label: 'Asia/Kolkata (IST - Indian Standard Time)',
    offset: 'UTC+05:30',
  },
  {
    value: 'Asia/Dubai',
    label: 'Asia/Dubai (GST - Gulf Standard Time)',
    offset: 'UTC+04:00',
  },
  {
    value: 'Asia/Singapore',
    label: 'Asia/Singapore (SGT - Singapore Time)',
    offset: 'UTC+08:00',
  },
  {
    value: 'Europe/London',
    label: 'Europe/London (GMT / BST)',
    offset: 'UTC+00:00',
  },
  {
    value: 'Europe/Berlin',
    label: 'Europe/Berlin (CET - Central European Time)',
    offset: 'UTC+01:00',
  },
  {
    value: 'America/New_York',
    label: 'America/New_York (EST / EDT)',
    offset: 'UTC-05:00',
  },
  {
    value: 'America/Los_Angeles',
    label: 'America/Los_Angeles (PST / PDT)',
    offset: 'UTC-08:00',
  },
  {
    value: 'Australia/Sydney',
    label: 'Australia/Sydney (AEST / AEDT)',
    offset: 'UTC+10:00',
  },
];

export interface TimezoneSelectProps {
  id?: string;
  value: string;
  onChange: (timezone: string) => void;
  error?: string;
  disabled?: boolean;
}

export function TimezoneSelect({
  id = 'onboarding-timezone-select',
  value,
  onChange,
  error,
  disabled = false,
}: TimezoneSelectProps) {
  return (
    <div>
      <div className="relative">
        <Clock className="pointer-events-none absolute top-3 left-3 h-4 w-4 text-slate-400" />
        <select
          id={id}
          aria-label="Default Timezone"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`h-10 w-full rounded-xl border bg-white pr-3 pl-9 text-xs font-medium text-slate-900 focus:ring-2 focus:outline-none ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/15'
              : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/15'
          }`}
        >
          <option value="">Select Default Timezone...</option>
          {TIMEZONE_OPTIONS.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label} [{tz.offset}]
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
