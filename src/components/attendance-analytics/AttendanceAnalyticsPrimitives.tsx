'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Clock,
  Info,
  Lock,
  RefreshCw,
  Table as TableIcon,
  X,
} from 'lucide-react';
import {
  AttendanceChartPoint,
  AttendanceMetricMetadata,
} from '../../types/attendanceAnalytics';

export function AttendanceSkeletonBlock({ rows = 4 }: { rows?: number }) {
  return (
    <div
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
      aria-busy="true"
      aria-label="Loading attendance analytics data"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="h-24 animate-pulse rounded-xl bg-slate-100 p-4"
          />
        ))}
      </div>
      <div className="space-y-2.5 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

export function AttendancePermissionDeniedState({
  role,
  moduleTitle,
  scopeDescription,
}: {
  role: string;
  moduleTitle: string;
  scopeDescription: string;
}) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
        <Lock className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-bold text-slate-900">
        Access Restricted for Role: <span className="uppercase">{role}</span>
      </h3>
      <p className="mx-auto mt-1.5 max-w-lg text-xs text-slate-600">
        Your current role does not have permission to view{' '}
        <span className="font-semibold text-slate-800">{moduleTitle}</span>.
      </p>
      <p className="mt-2 text-[11px] font-medium text-amber-800">
        Role Scope: {scopeDescription}
      </p>
    </div>
  );
}

export function AttendanceErrorState({
  title = 'Unable to load attendance analytics from API',
  message,
  onRetry,
  actionLabel,
  onAction,
}: {
  title?: string;
  message: string;
  onRetry: () => void;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-rose-200 bg-rose-50/60 p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-xs text-rose-700">{message}</p>
            <p className="mt-1 text-[11px] text-slate-500">
              All attendance metrics and anomalies are fetched strictly from the
              backend REST API (`/api/v1/attendance-analytics/*`) with zero
              client-side mock fallback.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
            >
              {actionLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry API Request
          </button>
        </div>
      </div>
    </div>
  );
}

export function AttendanceEmptyState({
  title,
  description,
  ctaLabel,
  onCta,
}: {
  title: string;
  description: string;
  ctaLabel?: string;
  onCta?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-8 text-center">
      <h4 className="text-sm font-bold text-slate-900">{title}</h4>
      <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
        {description}
      </p>
      {ctaLabel && onCta && (
        <button
          type="button"
          onClick={onCta}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}

export function AttendanceMetricFreshnessBadge({
  metadata,
}: {
  metadata?: AttendanceMetricMetadata;
}) {
  if (!metadata) return null;
  const freshnessColor =
    metadata.dataFreshness === 'RealTime'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : metadata.dataFreshness === 'Under5Min'
      ? 'bg-sky-50 text-sky-700 border-sky-200'
      : 'bg-amber-50 text-amber-700 border-amber-200';

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-[11px] text-slate-600">
      <span
        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-semibold ${freshnessColor}`}
      >
        <Clock className="h-3 w-3" />
        Freshness: {metadata.dataFreshness}
      </span>
      <span className="font-medium text-slate-700">
        As of: <span className="font-mono">{metadata.asOfTime || '—'}</span>
      </span>
      <span className="inline-flex items-center gap-1 text-slate-500">
        <Info className="h-3.5 w-3.5 text-indigo-500" />
        Definition: {metadata.definition}
      </span>
    </div>
  );
}

export function AccessibleChartTableFallback({
  title,
  points,
  unit = '',
}: {
  title: string;
  points: AttendanceChartPoint[];
  unit?: string;
}) {
  const [showTable, setShowTable] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between gap-2 pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-indigo-600" />
          <h4 className="text-xs font-bold text-slate-900">{title}</h4>
        </div>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
          aria-pressed={showTable}
        >
          <TableIcon className="h-3 w-3" />
          {showTable ? 'Show Visual Bars' : 'Accessible Data Table'}
        </button>
      </div>

      {points.length === 0 ? (
        <p className="py-6 text-center text-xs text-slate-400">
          No data points returned from API for this series.
        </p>
      ) : showTable ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                <th className="py-2 pr-3">Period / Segment</th>
                <th className="py-2 text-right">Metric Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {points.map((pt, i) => (
                <tr key={`${pt.label}-${i}`}>
                  <td className="py-2 pr-3 font-medium text-slate-800">
                    {pt.label}
                  </td>
                  <td className="py-2 text-right font-mono text-slate-700">
                    {pt.value}
                    {unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-2 pt-1">
          {points.map((pt, i) => {
            const widthPct = Math.max(4, Math.min(100, Number(pt.value) || 0));
            return (
              <div key={`${pt.label}-${i}`} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-slate-700">{pt.label}</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {pt.value}
                    {unit}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-600"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AttendanceModal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
