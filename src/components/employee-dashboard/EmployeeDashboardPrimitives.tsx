'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Inbox,
  RefreshCw,
  X,
} from 'lucide-react';
import { EmployeeDashboardApiError } from '../../services/employee-dashboard';

export interface WidgetResourceState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
  notApplicable: boolean;
  asOf: string | null;
  refresh: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

export function useWidgetResource<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: readonly (string | number | boolean | undefined | null)[] = []
): WidgetResourceState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const [notApplicable, setNotApplicable] = useState<boolean>(false);
  const [asOf, setAsOf] = useState<string | null>(null);

  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const depsKey = deps.map((d) => String(d ?? '')).join('|');

  const execute = useCallback(async (signal?: AbortSignal) => {
    await Promise.resolve();
    if (signal?.aborted) return;

    setLoading(true);
    setError(null);
    setPermissionDenied(false);
    setNotApplicable(false);

    const controller = new AbortController();
    const activeSignal = signal || controller.signal;

    try {
      const response = await fetcherRef.current(activeSignal);
      if (activeSignal.aborted) return;
      setData(response);
      const maybeEnvelope = response as unknown as { asOf?: string };
      setAsOf(maybeEnvelope?.asOf || new Date().toISOString());
    } catch (err) {
      if (activeSignal.aborted) return;
      if (err instanceof EmployeeDashboardApiError) {
        if (err.code === 'ABORTED') return;
        if (err.isPermissionDenied()) {
          setPermissionDenied(true);
          return;
        }
        if (err.isNotApplicable()) {
          setNotApplicable(true);
          return;
        }
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to load widget data from server.');
      }
    } finally {
      if (!activeSignal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      void execute(controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [execute, depsKey]);

  const refresh = useCallback(async () => {
    await execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    permissionDenied,
    notApplicable,
    asOf,
    refresh,
    setData,
  };
}

export interface WidgetCardProps {
  id: string;
  title: string;
  subtitle?: string;
  asOf?: string | null;
  loading?: boolean;
  error?: string | null;
  permissionDenied?: boolean;
  notApplicable?: boolean;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyCtaLabel?: string;
  onEmptyCta?: () => void;
  onRefresh?: () => void;
  headerAction?: React.ReactNode;
  isDark?: boolean;
  children: React.ReactNode;
}

export const WidgetCard = React.memo(function WidgetCard({
  id,
  title,
  subtitle,
  asOf,
  loading = false,
  error = null,
  permissionDenied = false,
  notApplicable = false,
  isEmpty = false,
  emptyTitle = 'No records available',
  emptyMessage = 'The API returned no records for this widget.',
  emptyCtaLabel = 'Refresh Widget',
  onEmptyCta,
  onRefresh,
  headerAction,
  isDark = false,
  children,
}: WidgetCardProps) {
  // Rule 4 & 9: Permission-denied or not-applicable widgets are hidden gracefully
  if (permissionDenied || notApplicable) {
    return null;
  }

  const formattedAsOf = asOf
    ? (() => {
        const parsed = new Date(asOf);
        return Number.isNaN(parsed.getTime())
          ? asOf
          : parsed.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
      })()
    : null;

  return (
    <section
      id={`widget-${id}`}
      data-testid={`widget-${id}`}
      aria-label={title}
      className={`rounded-2xl border p-5 transition-colors ${
        isDark
          ? 'border-slate-800 bg-slate-900 text-slate-100'
          : 'border-slate-200 bg-white text-slate-900'
      }`}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/70 pb-3 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold tracking-tight">{title}</h2>
          {subtitle ? (
            <p
              className={`mt-0.5 text-xs ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {formattedAsOf ? (
            <span
              className={`inline-flex items-center gap-1 font-mono text-[11px] tabular-nums ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
              title={`Last synced at ${asOf}`}
            >
              <Clock className="h-3 w-3" />
              As of {formattedAsOf}
            </span>
          ) : null}

          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              aria-label={`Refresh ${title}`}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              } disabled:opacity-50`}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
              />
            </button>
          ) : null}

          {headerAction}
        </div>
      </div>

      {loading ? (
        <div
          role="status"
          aria-live="polite"
          aria-label={`Loading ${title}`}
          className="space-y-3 py-2"
        >
          <div
            className={`h-5 w-2/5 animate-pulse rounded-lg ${
              isDark ? 'bg-slate-800' : 'bg-slate-100'
            }`}
          />
          <div
            className={`h-16 w-full animate-pulse rounded-xl ${
              isDark ? 'bg-slate-800' : 'bg-slate-100'
            }`}
          />
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`h-12 animate-pulse rounded-xl ${
                isDark ? 'bg-slate-800' : 'bg-slate-100'
              }`}
            />
            <div
              className={`h-12 animate-pulse rounded-xl ${
                isDark ? 'bg-slate-800' : 'bg-slate-100'
              }`}
            />
          </div>
        </div>
      ) : error ? (
        <div
          role="alert"
          aria-live="assertive"
          className={`rounded-xl border p-4 ${
            isDark
              ? 'border-rose-900/60 bg-rose-950/30 text-rose-200'
              : 'border-rose-200 bg-rose-50/70 text-rose-900'
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <div className="flex-1">
              <p className="text-xs font-semibold">
                Could not load {title} from API
              </p>
              <p className="mt-1 font-mono text-[11px] opacity-90">{error}</p>
              {onRefresh ? (
                <button
                  type="button"
                  onClick={onRefresh}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry Request
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : isEmpty ? (
        <div
          className={`flex flex-col items-center justify-center rounded-xl border border-dashed py-7 text-center ${
            isDark
              ? 'border-slate-800 bg-slate-950/40'
              : 'border-slate-200 bg-slate-50/60'
          }`}
        >
          <Inbox className="h-6 w-6 text-slate-400" />
          <p className="mt-2 text-xs font-semibold">{emptyTitle}</p>
          <p
            className={`mt-1 max-w-sm px-4 text-xs ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {emptyMessage}
          </p>
          {(onEmptyCta || onRefresh) && (
            <button
              type="button"
              onClick={onEmptyCta || onRefresh}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
            >
              {emptyCtaLabel}
            </button>
          )}
        </div>
      ) : (
        children
      )}
    </section>
  );
});

export interface ConfirmActionDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  requireReason?: boolean;
  reasonLabel?: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export function ConfirmActionDialog({
  open,
  title,
  description,
  confirmLabel,
  requireReason = false,
  reasonLabel = 'Reason',
  isSubmitting = false,
  onClose,
  onConfirm,
}: ConfirmActionDialogProps) {
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requireReason && !reason.trim()) {
      setValidationError(`${reasonLabel} is required.`);
      return;
    }
    setValidationError(null);
    await onConfirm(reason.trim());
    setReason('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold">{title}</h3>
            <p className="mt-1 text-xs text-slate-500">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close confirmation dialog"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {requireReason && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                {reasonLabel} <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide a reason for audit trail..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
              {validationError && (
                <p className="mt-1 text-xs font-medium text-rose-600">
                  {validationError}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
